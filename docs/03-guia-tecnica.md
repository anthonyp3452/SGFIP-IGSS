# Guía Técnica y Despliegue

## SGFIP — Sistema de Gestión de Flujo de Informes Patronales

---

## Índice

1. [Repositorio](#1-repositorio)
2. [Requisitos Locales](#2-requisitos-locales)
3. [Configuración Local](#3-configuración-local)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Base de Datos](#5-base-de-datos)
6. [API Reference](#6-api-reference)
7. [Despliegue en Producción](#7-despliegue-en-producción)
8. [Mantenimiento](#8-mantenimiento)

---

## 1. Repositorio

El código fuente está alojado en GitHub:

**https://github.com/anthonyp3452/SGFIP-IGSS**

Ramas:
- `main` — Rama de producción

---

## 2. Requisitos Locales

| Herramienta | Versión Mínima |
|-------------|---------------|
| Node.js | 20.x |
| npm | 10.x |
| PostgreSQL | 16.x |
| Git | 2.x |

---

## 3. Configuración Local

### 3.1 Clonar el Repositorio

```bash
git clone https://github.com/anthonyp3452/SGFIP-IGSS.git
cd SGFIP-IGSS
```

### 3.2 Configurar Variables de Entorno

Crear archivo `backend/.env`:

```env
APP_NAME=nest-backend
NODE_ENV=development
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sgfip

# Autenticación
JWT_SECRET=tu_secreto_jwt_aqui_64_caracteres_hex_0000000000000000000000000000000
JWT_EXPIRES_IN_SECONDS=86400
AUTH_DEFAULT_ROLE_ID=2

# Frontend (CORS)
FRONTEND_URL=http://localhost:5500
```

### 3.3 Instalar Dependencias

```bash
cd backend
npm install
```

### 3.4 Configurar la Base de Datos

1. Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE sgfip;
```

2. Ejecutar las migraciones en orden:
```bash
# Usando psql o cualquier cliente PostgreSQL
psql -U postgres -d sgfip -f backend/sql/production-migration.sql
```

O ejecutar las migraciones incrementales en orden numérico:
```bash
for file in backend/sql/[0-9]*.sql; do
  psql -U postgres -d sgfip -f "$file"
done
```

### 3.5 Iniciar el Backend

```bash
cd backend
npm run start:dev
```

El servidor se iniciará en **http://localhost:3000**

### 3.6 Iniciar el Frontend

El frontend es estático, se puede abrir directamente en el navegador o usar cualquier servidor estático:

```bash
# Usando VS Code Live Server
# O con http-server:
npx http-server frontend -p 5500
```

Para desarrollo, el frontend se conecta automáticamente a `http://localhost:3000` cuando se abre desde `file://` o `localhost`.

---

## 4. Estructura del Proyecto

```
SGFIP-IGSS/
├── backend/
│   ├── src/
│   │   ├── main.ts                    # Punto de entrada
│   │   ├── app.module.ts              # Módulo raíz
│   │   ├── config/
│   │   │   ├── env.configuration.ts   # Configuración de entorno
│   │   │   └── database.config.ts     # Configuración TypeORM
│   │   └── modules/
│   │       ├── auth/                  # Autenticación (JWT, login, registro)
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── auth.module.ts
│   │       │   ├── jwt.strategy.ts
│   │       │   ├── jwt-auth.guard.ts
│   │       │   ├── roles.guard.ts
│   │       │   ├── roles.decorator.ts
│   │       │   ├── dto/
│   │       │   │   ├── login.dto.ts
│   │       │   │   └── register.dto.ts
│   │       │   └── interfaces/
│   │       │       └── jwt-payload.interface.ts
│   │       ├── usuarios/              # Gestión de usuarios
│   │       │   ├── usuario.entity.ts
│   │       │   ├── usuarios.controller.ts
│   │       │   ├── usuarios.service.ts
│   │       │   └── usuarios.module.ts
│   │       ├── informes/              # Gestión de informes patronales
│   │       │   ├── informe.entity.ts
│   │       │   ├── informe-anulado.entity.ts
│   │       │   ├── auditoria-informe.entity.ts
│   │       │   ├── informe-secuencia.entity.ts
│   │       │   ├── informes.controller.ts
│   │       │   ├── informes.service.ts
│   │       │   ├── informes.module.ts
│   │       │   ├── const/
│   │       │   │   └── informe-estados.ts
│   │       │   └── dto/
│   │       │       ├── solicitar-informe.dto.ts
│   │       │       ├── filtrar-informes.dto.ts
│   │       │       ├── enviar-revision.dto.ts
│   │       │       ├── aprobar-informe.dto.ts
│   │       │       ├── devolver-informe.dto.ts
│   │       │       └── anular-informe.dto.ts
│   │       ├── invitaciones/          # Códigos de invitación
│   │       │   ├── invitacion.entity.ts
│   │       │   ├── invitaciones.controller.ts
│   │       │   ├── invitaciones.service.ts
│   │       │   ├── invitaciones.module.ts
│   │       │   └── dto/
│   │       │       └── generar-invitacion.dto.ts
│   │       ├── admin/                 # Administración y monitoreo
│   │       │   ├── admin.controller.ts
│   │       │   ├── admin.service.ts
│   │       │   └── admin.module.ts
│   │       └── health/                # Health check
│   │           ├── health.controller.ts
│   │           ├── health.service.ts
│   │           └── health.module.ts
│   ├── sql/                           # Migraciones SQL
│   ├── package.json
│   ├── tsconfig.json
│   └── Procfile                       # Render start command
│
├── frontend/
│   ├── index.html                     # Login
│   ├── register.html                  # Registro
│   ├── app.html                       # Aplicación SPA
│   ├── js/
│   │   ├── config.js                  # Configuración del frontend
│   │   └── toast.js                   # Notificaciones toast
│   └── images/
│       └── logo.jpg                   # Logo IGSS
│
└── docs/
    ├── 01-resumen-general.md          # Resumen del sistema
    ├── 02-manual-usuario.md           # Manual de usuario
    └── 03-guia-tecnica.md             # Guía técnica
```

---

## 5. Base de Datos

### 5.1 Migraciones SQL

Las migraciones se encuentran en `backend/sql/` y deben ejecutarse en orden numérico:

| Archivo | Descripción |
|---------|-------------|
| `production-migration.sql` | Esquema completo de producción (todas las tablas) |
| `001_informe_secuencia.sql` | Tabla de contadores anuales de informes |
| `002_informes_tipo_inspeccion.sql` | Columna `tipo_inspeccion` |
| `003_informe_campos_workflow.sql` | Columnas `supervisor_id`, `observacion` |
| `004_auditoria_informes.sql` | Tabla de auditoría |
| `005_informe_anulados.sql` | Tabla de números saltados |
| `006_username.sql` | Migración de email a username |
| `007_anulacion.sql` | Columna `motivo_anulacion` |
| `008_invitaciones.sql` | Tabla de invitaciones |

### 5.2 Esquema de Tablas

#### `usuarios`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| usuario_id | SERIAL PK | ID único |
| nombre | VARCHAR(255) | Nombre completo |
| email | VARCHAR(255) | Correo electrónico (opcional) |
| username | VARCHAR(255) UNIQUE | Nombre de usuario (sufijo .igss) |
| rol_id | INT | 1=Admin, 2=Inspector, 3=Supervisor |
| supervisor_id | INT NULL | Supervisor asignado |
| password_hash | VARCHAR(255) NULL | Hash de contraseña |
| activo | BOOLEAN DEFAULT true | Estado de la cuenta |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

#### `informes`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| informe_id | SERIAL PK | ID interno |
| numero_informe | VARCHAR(20) UNIQUE | Número de informe (formato: AÑO-NNNNN) |
| inspector_id | INT FK→usuarios | Inspector asignado |
| supervisor_id | INT FK→usuarios NULL | Supervisor asignado |
| tipo_inspeccion | VARCHAR(50) | Tipo de inspección |
| estado | VARCHAR(20) | Estado actual del flujo |
| nombre_patrono | VARCHAR(255) NULL | Nombre del patrono |
| nit_patrono | VARCHAR(20) NULL | NIT del patrono |
| direccion_patrono | TEXT NULL | Dirección |
| observacion | TEXT NULL | Observación de devolución |
| motivo_anulacion | TEXT NULL | Motivo de anulación |
| fecha_limite | DATE NULL | Fecha límite |
| descripcion | TEXT NULL | Descripción de inspección |
| no_afiliacion_riesgo | VARCHAR(50) NULL | No. afiliación |
| no_oficio | VARCHAR(50) NULL | No. oficio aprobación |
| fecha_oficio | DATE NULL | Fecha de oficio |
| envio | VARCHAR(100) NULL | Medio de envío |
| iniciado_at | TIMESTAMP NULL | Inicio de trabajo |
| enviado_revision_at | TIMESTAMP NULL | Envío a revisión |
| finalizado_at | TIMESTAMP NULL | Finalización |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

#### `auditoria_informes`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| auditoria_id | BIGSERIAL PK | ID único |
| informe_id | INT FK→informes | Informe relacionado |
| numero_informe | VARCHAR(20) | Número de informe |
| usuario_id | INT NULL | Usuario que realizó la acción |
| accion | VARCHAR(50) | Acción realizada |
| estado_anterior | VARCHAR(20) NULL | Estado previo |
| estado_nuevo | VARCHAR(20) NULL | Estado nuevo |
| detalle | TEXT NULL | Detalle adicional |
| created_at | TIMESTAMP | Fecha de la acción |

#### `invitaciones`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | SERIAL PK | ID único |
| codigo | UUID UNIQUE | Código de invitación |
| rol_id | INT | Rol asignado (2 o 3) |
| supervisor_id | INT NULL | Supervisor asignado |
| usado | BOOLEAN DEFAULT false | Si ya fue utilizado |
| creado_por | INT | Admin que lo generó |
| created_at | TIMESTAMP | Fecha de creación |
| used_at | TIMESTAMP NULL | Fecha de uso |

---

## 6. API Reference

### 6.1 Autenticación

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| POST | `/api/auth/register` | No | — | Registrar con código de invitación |
| POST | `/api/auth/login` | No | — | Iniciar sesión |
| GET | `/api/auth/me` | JWT | — | Obtener usuario actual |

### 6.2 Usuarios

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/usuarios` | JWT | 1 | Listar todos |
| GET | `/api/usuarios/inspectores` | JWT | — | Listar inspectores activos |
| GET | `/api/usuarios/supervisores` | JWT | — | Listar supervisores activos |
| GET | `/api/usuarios/:id` | JWT | — | Obtener usuario |
| POST | `/api/usuarios` | JWT | 1 | Crear usuario |
| PATCH | `/api/usuarios/:id` | JWT | 1 | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | JWT | 1 | Eliminar usuario |

### 6.3 Informes

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| POST | `/api/informes` | JWT | 2 | Crear nuevo número de informe |
| GET | `/api/informes` | JWT | — | Listar informes (con filtros) |
| GET | `/api/informes/en-revision` | JWT | 1,3 | Informes en revisión |
| GET | `/api/informes/mis-informes` | JWT | — | Informes del inspector |
| GET | `/api/informes/:id` | JWT | — | Detalle del informe + auditoría |
| PATCH | `/api/informes/:id/iniciar` | JWT | 2 | Iniciar proceso |
| PATCH | `/api/informes/:id/enviar-revision` | JWT | 2 | Enviar a revisión |
| PATCH | `/api/informes/:id/aprobar` | JWT | 3 | Aprobar y finalizar |
| PATCH | `/api/informes/:id/devolver` | JWT | 1,3 | Devolver con observaciones |
| PATCH | `/api/informes/:id/anular` | JWT | 3 | Anular informe |

### 6.4 Invitaciones

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| POST | `/api/invitaciones` | JWT | 1 | Generar código |
| GET | `/api/invitaciones` | JWT | 1 | Listar códigos |
| DELETE | `/api/invitaciones/:id` | JWT | 1 | Eliminar código |

### 6.5 Administración

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/admin/tiempos/inspectores` | JWT | 1 | Tiempos por inspector |
| GET | `/api/admin/tiempos/supervisores` | JWT | 1 | Tiempos por supervisor |
| GET | `/api/admin/tiempos/general` | JWT | 1 | Estadísticas generales |
| GET | `/api/admin/secuencia` | JWT | 1 | Ver contadores |
| POST | `/api/admin/secuencia/anular` | JWT | 1 | Saltar números |
| POST | `/api/admin/secuencia/reiniciar` | JWT | 1 | Reiniciar contador |
| GET | `/api/admin/auditoria` | JWT | 1 | Registros de auditoría |
| GET | `/api/admin/auditoria/:id` | JWT | 1 | Auditoría por informe |

### 6.6 Salud

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | No | Estado del servidor |

---

## 7. Despliegue en Producción

### 7.1 Base de Datos — Neon

1. Crear una cuenta en **https://neon.tech**
2. Crear un proyecto y obtener la cadena de conexión (Connection String)
3. En la consola de Neon (SQL Editor), ejecutar el archivo `backend/sql/production-migration.sql`

### 7.2 Backend — Render

1. Crear un **Web Service** en **https://render.com**
2. Conectar el repositorio de GitHub
3. Configurar:

| Configuración | Valor |
|--------------|-------|
| Root Directory | `backend` |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `node dist/main.js` |
| Node Version | 20 |

4. Agregar las siguientes **Environment Variables**:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=<generar_secreto_64_caracteres>
JWT_EXPIRES_IN_SECONDS=86400
DB_HOST=<neon-host>
DB_PORT=5432
DB_USER=<neon-user>
DB_PASSWORD=<neon-password>
DB_NAME=<neon-database>
FRONTEND_URL=https://sgfip-igss.vercel.app
```

> **Importante**: La base de datos de Neon requiere `sslmode=require`. El backend está configurado para usar SSL con `rejectUnauthorized: false` en producción.

### 7.3 Frontend — Vercel

1. Crear un proyecto en **https://vercel.com**
2. Conectar el repositorio de GitHub
3. Configurar:

| Configuración | Valor |
|--------------|-------|
| Root Directory | `frontend` |
| Output Directory | `.` |
| Build Command | Ninguno (estático) |

### 7.4 Actualizar Frontend Config

El archivo `frontend/js/config.js` detecta automáticamente el entorno:
- Si la URL es `file://` o `localhost`, usa `http://localhost:3000`
- De lo contrario, usa `https://sgfip-igss.onrender.com`

Se puede sobrescribir definiendo `window.__SGFIP_API_URL__` antes de que cargue el script.

### 7.5 Procfile

El archivo `Procfile` en la raíz indica a Render cómo iniciar:
```
web: cd backend && node dist/main.js
```

---

## 8. Mantenimiento

### 8.1 Agregar el Primer Usuario Administrador

Ejecutar en la base de datos:

```sql
INSERT INTO usuarios (nombre, username, rol_id, password_hash, activo)
VALUES (
  'Administrador',
  'admin.igss',
  1,
  '<hash_bcrypt_de_la_contraseña>',
  true
);
```

Para generar un hash bcrypt, puede usar Node.js:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('tu_contraseña', 10);
console.log(hash);
```

### 8.2 Agregar Nuevas Migraciones

1. Crear el archivo SQL en `backend/sql/` con el número siguiente:
   - Ejemplo: `009_nueva_funcionalidad.sql`
2. Ejecutar en la base de datos de Neon usando el SQL Editor
3. Documentar el cambio en el README

### 8.3 Respaldos

Neon realiza respaldos automáticos. Se recomienda:
- Configurar respaldos semanales como mínimo
- Antes de cualquier migración importante, hacer un respaldo manual

### 8.4 Monitoreo

- **Render**: Dashboard con logs, métricas y alertas
- **Neon**: Dashboard con uso de base de datos, consultas lentas
- **Vercel**: Dashboard con analíticas de visitas y rendimiento

---

## 9. Estados del Informe y Transiciones

```typescript
const ESTADOS = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En Proceso',
  EN_REVISION: 'En Revision',
  FINALIZADO: 'Finalizado',
  DEVUELTO: 'Devuelto',
  ANULADO: 'Anulado',
};

const TRANSICIONES = {
  Pendiente:   ['En Proceso', 'Anulado'],
  'En Proceso':  ['En Revision', 'Anulado'],
  'En Revision': ['Finalizado', 'Devuelto', 'Anulado'],
  Devuelto:     ['En Proceso', 'Anulado'],
  Finalizado:   [],
  Anulado:      [],
};
```

---

## 10. Convenciones de Código

### Backend (NestJS/TypeScript)
- Módulos organizados por funcionalidad
- Controladores manejan HTTP, servicios contienen lógica de negocio
- DTOs con validación mediante class-validator
- Decoradores `@Roles()` para control de acceso
- JWT extraído y validado mediante Passport Strategy

### Frontend (Vanilla JS)
- Sin frameworks ni librerías externas
- Configuración centralizada en `js/config.js`
- Notificaciones mediante `js/toast.js`
- Vistas manejadas con `showView()` y secciones `view-*`
- Sesión almacenada en `localStorage`
- Peticiones HTTP con `fetch()` y manejo de errores consistente
