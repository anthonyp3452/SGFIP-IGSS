# Sistema de Invitaciones (Códigos)

## Propósito

Permitir el registro de nuevos usuarios (Inspectores y Supervisores) mediante códigos de invitación generados por un Administrador. El código determina el rol y la asignación de supervisor del nuevo usuario.

---

## Flujo completo

```
ADMIN → genera código → comparte con usuario → usuario se registra con el código → cuenta creada
```

---

## 1. Generación del código

### Backend

**Endpoint:** `POST /api/invitaciones`

**Seguridad:** Solo ADMIN autenticado con JWT y rol 1.

**DTO:**
```
{
  rolId: number        // 2 = Inspector, 3 = Supervisor
  supervisorId?: number // opcional, solo cuando rolId = 2
}
```

**Lógica** (`invitaciones.service.ts`):
1. Genera un UUID v4 con `randomUUID()` de `node:crypto`
2. Inserta en tabla `invitaciones`: `{ codigo, rolId, creadoPor, supervisorId }`
3. Retorna `{ codigo: "uuid-string" }`

### Frontend

**Ubicación:** Admin → Usuarios → tab Invitaciones

1. Admin selecciona rol (Inspector/Supervisor) y opcionalmente un supervisor
2. Envía POST al backend
3. Muestra el código generado en un modal
4. Admin lo copia o comparte vía WhatsApp/copiar

---

## 2. Registro con el código

**Endpoint:** `POST /api/auth/register`

**Body:**
```
{
  nombre: string
  username: string
  password: string
  codigo: string    // UUID recibido
}
```

### Backend — Validación

**Paso 1 — `invitacionesService.validar(codigo)`:**
- Busca el código en BD
- Si no existe → `NotFoundException` (404, "Código de invitación inválido")
- Si ya fue usado (`usado = true`) → `BadRequestException` (400, "El código de invitación ya fue usado")
- Si ok → retorna la entidad con `rolId` y `supervisorId`

**Paso 2 — Creación de usuario:**
- Verifica que el username no esté duplicado (409 si existe)
- Hashea password con bcrypt (10 rondas)
- Crea usuario con `rolId` y `supervisorId` de la invitación

**Paso 3 — Marcar código como usado:**
- `invitacionesService.usar(codigo)` → setea `usado = true` y `usedAt = now()`

**Paso 4 — Retorna JWT:**
```
{ accessToken, user: { usuarioId, username, nombre, rolId } }
```

---

## 3. Estructura de datos

### Tabla `invitaciones` (PostgreSQL)

| Columna       | Tipo           | Descripción                          |
|---------------|----------------|--------------------------------------|
| id            | SERIAL PK      | ID autoincrementable                 |
| codigo        | varchar(36) UNIQUE | UUID v4                          |
| rol_id        | integer NOT NULL | Rol asignado (2 o 3)                |
| supervisor_id | integer        | Supervisor para inspectores (opcional) |
| usado         | boolean DEFAULT false | Si ya fue consumido               |
| creado_por    | integer NOT NULL | ID del admin que lo generó          |
| created_at    | timestamptz    | Fecha de creación                    |
| used_at       | timestamptz    | Fecha de uso (nullable)              |

### Entity TypeORM (`invitacion.entity.ts`)

```typescript
@Entity('invitaciones')
export class Invitacion {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 36, unique: true }) codigo: string;
  @Column({ name: 'rol_id' }) rolId: number;
  @Column({ name: 'supervisor_id', nullable: true }) supervisorId?: number;
  @Column({ default: false }) usado: boolean;
  @Column({ name: 'creado_por' }) creadoPor: number;
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' }) createdAt: Date;
  @Column({ name: 'used_at', type: 'timestamptz', nullable: true }) usedAt?: Date;
}
```

---

## 4. Seguridad

- Solo ADMIN puede generar códigos (`@Roles(1)` + JWT guard)
- Códigos UUID v4 criptográficamente aleatorios (no secuenciales, no predecibles)
- Un solo uso: al registrarse, `usado = true`, no se puede reutilizar
- El rol queda fijo en la invitación; el usuario no puede elegirlo
- Username se normaliza con sufijo `.igss` automáticamente

---

## Archivos involucrados

**Backend:**
- `backend/src/modules/invitaciones/invitaciones.controller.ts`
- `backend/src/modules/invitaciones/invitaciones.service.ts`
- `backend/src/modules/invitaciones/invitacion.entity.ts`
- `backend/src/modules/invitaciones/invitaciones.module.ts`
- `backend/src/modules/invitaciones/dto/generar-invitacion.dto.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/sql/008_invitaciones.sql`

**Frontend:**
- `frontend/register.html`
- `frontend/app.html` (tab Invitaciones en admin)
