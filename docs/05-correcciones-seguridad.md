# Correcciones de Seguridad

## Resumen

| ID | Vulnerabilidad | Estado |
|----|---------------|--------|
| F2.3 | User Enumeration | Implementado |
| F1.1 | XSS (Cross-Site Scripting) | Implementado |
| F2.1 | Content Security Policy (CSP) | Implementado |
| F2.4 | Mass Assignment / Falta de validación | Implementado |
| F2.5 | Sanitización de entrada | Implementado |
| — | Rate Limiting | Implementado |
| — | Helmet (HTTP headers) | Implementado |
| — | CORS restringido | Implementado |

---

## F2.3 — User Enumeration

**Problema:** El login retornaba errores distintos si el usuario existía ("Usuario no encontrado") vs si la contraseña era incorrecta ("Contraseña incorrecta"). Esto permitía a un atacante descubrir qué usuarios están registrados.

**Solución:** Error unificado `'Credenciales inválidas'` para todos los casos de fallo.

```typescript
// auth.service.ts
if (
  !usuario ||
  !usuario.passwordHash ||
  !usuario.activo ||
  !(await bcrypt.compare(password, usuario.passwordHash))
) {
  throw new UnauthorizedException('Credenciales inválidas');
}
```

El mismo mensaje se devuelve si:
- El usuario no existe
- El usuario no tiene password (registro externo)
- El usuario está inactivo
- La contraseña es incorrecta

**Frontend:** `index.html` también usa mensaje genérico y descarta detalles del error.

---

## F1.1 — XSS (Cross-Site Scripting)

**Problema:** El frontend insertaba datos de la API directamente con `innerHTML` sin escapar caracteres HTML. Un dato como `<script>alert('xss')</script>` se ejecutaba en el navegador.

**Solución:** Función `esc()` que escapa 5 caracteres HTML.

```javascript
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

**Cobertura:** ~40 puntos de inyección en `app.html`:
- Tablas de informes, bandejas, detalle de informe
- Dashboard (KPIs, distribución, alertas, rendimiento)
- Monitoreo (inspectores, supervisores, timeline)
- Usuarios e invitaciones

---

## F2.1 — Content Security Policy (CSP)

**Problema:** No había restricciones sobre qué recursos puede cargar el navegador. Cualquier script inyectado se ejecutaba sin restricciones.

**Solución:** Meta tag CSP en los 3 HTMLs:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'self' https://sgfip-igss.onrender.com http://localhost:3000;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
">
```

| Directiva | Efecto |
|-----------|--------|
| `default-src 'self'` | Solo recursos del mismo origen |
| `connect-src` | Solo al backend autorizado |
| `frame-src 'none'` | Previene clickjacking |
| `object-src 'none'` | Previene plugins |
| `base-uri 'self'` | Previene base URI injection |

**Backend:** `app.use(helmet())` agrega headers HTTP:
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security`
- `Referrer-Policy`

---

## F2.4 — Mass Assignment / Validación de entrada

**Problema:** Sin DTOs, un atacante podía enviar campos como `passwordHash` o `rolId=1` para escalar privilegios.

**Solución:** DTOs con `class-validator` + `ValidationPipe` global.

### CrearUsuarioDto

| Campo | Validaciones |
|-------|-------------|
| nombre | `@IsString()`, `@IsNotEmpty()`, `@MaxLength(100)` |
| username | `@IsString()`, `@MinLength(3)`, `@Matches(/^[a-z0-9._-]+$/i)` |
| password | `@MinLength(8)`, `@Matches(/(?=.*\d)/)`, `@Matches(/(?=.*[!@#$%^&*()])/)` |
| rolId | `@IsInt()` |
| supervisorId | `@IsOptional()`, `@IsInt()` |

### ActualizarUsuarioDto

Solo permite: `nombre?`, `rolId?`, `activo?`.  
**No permite:** `passwordHash`, `username`, `password`.

### ValidationPipe global (`main.ts`)

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // elimina campos no definidos en el DTO
  transform: true,           // transforma tipos automáticamente
  forbidNonWhitelisted: true // rechaza campos desconocidos (400)
}));
```

---

## F2.5 — Sanitización de entrada

**Problema:** Datos ingresados por usuarios (descripciones, observaciones, direcciones) podían contener HTML malicioso.

**Solución multicapa:**

| Capa | Mecanismo |
|------|-----------|
| 1. Backend DTOs | `@MaxLength()`, `@Matches()`, `@IsString()` |
| 2. Backend ValidationPipe | `whitelist: true` elimina campos extra |
| 3. Frontend `esc()` | Escapa HTML al renderizar (defensa principal) |
| 4. CSP | Bloquea ejecución de scripts aunque el escape falle |

---

## Extras

### Rate Limiting (`main.ts`)

```typescript
import * as rateLimit from 'express-rate-limit';

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
```

- 20 intentos por 15 minutos en `/api/auth` (login + register)
- 200 requests/minuto global

### CORS (`main.ts`)

```typescript
app.enableCors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://sgfip-igss.vercel.app'
    : ['http://localhost:5500', 'http://localhost:3000'],
  credentials: true,
});
```

Origen restringido en producción solo al frontend en Vercel.

---

## Archivos involucrados

**Backend:**
- `backend/src/modules/auth/auth.service.ts` (F2.3)
- `backend/src/main.ts` (F2.1, Rate Limit, CORS, ValidationPipe)
- `backend/src/modules/usuarios/dto/crear-usuario.dto.ts` (F2.4)
- `backend/src/modules/usuarios/dto/actualizar-usuario.dto.ts` (F2.4)
- `backend/src/modules/auth/dto/*.ts`
- `backend/src/modules/informes/dto/*.ts`

**Frontend:**
- `frontend/app.html` (F1.1 — función `esc()` + ~40 usos)
- `frontend/index.html` (F2.1 — CSP, F2.3 — mensaje genérico)
- `frontend/register.html` (F2.1 — CSP)
