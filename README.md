# SGFIP — Sistema de Gestión de Flujo de Informes Patronales

Sistema para el IGSS — Delegación Retalhuleu, área de Inspección Patronal.

## Estructura del proyecto

```
sgfip/
├── frontend/              # Aplicación web (HTML + CSS + JS vanilla)
│   ├── login.html         # Pantalla de inicio de sesión
│   ├── app.html           # Aplicación principal post-login
│   └── js/
│       ├── toast.js       # Sistema de notificaciones visuales
│       └── config.js      # Configuración de URLs (dev / prod)
├── backend/               # API REST (NestJS + TypeScript + PostgreSQL)
│   ├── src/
│   │   ├── config/        # Configuración de entorno y base de datos
│   │   ├── modules/
│   │   │   ├── auth/      # Autenticación (JWT, Google OAuth2)
│   │   │   ├── health/    # Endpoint de monitoreo
│   │   │   ├── informes/  # CRUD + workflow de informes
│   │   │   └── usuarios/  # CRUD de usuarios
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── sql/               # Migraciones para producción
│   ├── test/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── Procfile               # Para Render
├── .gitignore
└── README.md
```

## Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript vanilla
- **Backend:** NestJS 11, TypeScript, TypeORM, Passport.js
- **Base de datos:** PostgreSQL (Neon)
- **Autenticación:** JWT + Google OAuth2

## Requisitos

- Node.js >= 18
- PostgreSQL (desarrollo local)
- Cuentas gratuitas en: [Render](https://render.com), [Neon](https://neon.tech), [Vercel](https://vercel.com)

## Desarrollo local

```bash
# Backend
cd backend
cp .env.example .env        # Ajustar credenciales
npm install
npm run start:dev

# Frontend (servir con cualquier servidor estático)
npx serve frontend
```

---

## 🚀 Despliegue a producción (gratuito)

### 1. Neon — Base de datos PostgreSQL

1. Ir a [neon.tech](https://neon.tech) y crear cuenta (gratis)
2. Crear un **proyecto** nuevo → elegir región **US East (us-east-2)**
3. Copiar el **connection string** que aparece:
   ```
   postgres://usuario:password@ep-xxxx.us-east-2.aws.neon.tech/nombre_db?sslmode=require
   ```
4. En la consola SQL de Neon ejecutar **todo el contenido** de:
   ```
   backend/sql/production-migration.sql
   ```
   Esto crea las tablas `usuarios`, `informes` e `informe_secuencia`.

### 2. Render — Backend API

1. Ir a [render.com](https://render.com) y crear cuenta (gratis)
2. En el Dashboard → **New +** → **Web Service**
3. Conectar tu repositorio de GitHub
4. Configurar:
   | Campo | Valor |
   |-------|-------|
   | **Name** | `sgfip-back` |
   | **Region** | `US East (Ohio)` |
   | **Branch** | `main` |
   | **Runtime** | `Node` |
   | **Build Command** | `cd backend && npm install && npm run build` |
   | **Start Command** | `cd backend && node dist/main.js` |
   | **Plan** | **Free** |
5. En **Advanced** → **Environment Variables** agregar:

   | Variable | Valor |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |
   | `FRONTEND_URL` | `https://sgfip-front.vercel.app` (o tu URL de Vercel) |
   | `DB_HOST` | `ep-xxxx.us-east-2.aws.neon.tech` (sin `https://`) |
   | `DB_PORT` | `5432` |
   | `DB_USER` | El usuario del connection string |
   | `DB_PASSWORD` | La contraseña del connection string |
   | `DB_NAME` | El nombre de la base de datos |
   | `JWT_SECRET` | Generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `JWT_EXPIRES_IN_SECONDS` | `86400` |
   | `AUTH_DEFAULT_ROLE_ID` | `2` |
   | `GOOGLE_CLIENT_ID` | Tu Client ID de Google OAuth |
   | `GOOGLE_CLIENT_SECRET` | Tu Client Secret de Google |
    | `GOOGLE_CALLBACK_URL` | `https://sgfip-igss.onrender.com/api/auth/google/callback` |

6. Click **Create Web Service** — esperar ~3 min a que termine el build
7. Una vez desplegado, Render asigna una URL como: `https://sgfip-igss.onrender.com`

### 3. Vercel — Frontend

1. Ir a [vercel.com](https://vercel.com) y crear cuenta (gratis)
2. **Add New...** → **Project**
3. Importar el mismo repositorio de GitHub
4. Configurar:
   | Campo | Valor |
   |-------|-------|
   **Framework Preset** | `Other` |
   **Root Directory** | `frontend` |
   **Build Command** | *(dejar vacío)* |
   **Output Directory** | `.` (el directorio raíz del frontend) |
5. Click **Deploy**
6. Vercel asigna una URL como: `https://sgfip-front.vercel.app`

> ⚠️ Después del deploy, editar `frontend/js/config.js` en el repositorio
> y cambiar la URL de producción de Render si es necesario.
> Luego hacer commit + push; Vercel se redeployea automáticamente.

### 4. Google OAuth — Configurar URIs

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Proyecto → **Credentials** → Editar tu OAuth 2.0 Client ID
3. En **Authorized JavaScript origins** agregar:
   ```
   https://sgfip-front.vercel.app
   ```
4. En **Authorized redirect URIs** agregar:
   ```
    https://sgfip-igss.onrender.com/api/auth/google/callback
   ```

### 5. Primer usuario administrador

Como `synchronize` está deshabilitado en producción, debes insertar manualmente
el primer admin en la base de datos desde la consola SQL de Neon:

```sql
-- Contraseña: Admin123! (cambiar después)
INSERT INTO usuarios (nombre, email, rol_id, password_hash, activo)
VALUES (
  'Administrador',
  'admin@igss.gob.gt',
  1,
  '$2a$10$K8ZpX2Y1K8ZpX2Y1K8ZpXOabcdefghij123456789ABCDEFGHIJ123456',
  true
);
```

Para generar un hash bcrypt real:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin123!', 10).then(console.log)"
```

---

## Roles

| Rol         | ID | Acceso                                |
|-------------|----|---------------------------------------|
| Admin       | 1  | Todo el sistema                       |
| Inspector   | 2  | Informes, inspecciones, consulta      |
| Consulta    | 3  | Solo consulta pública                 |

## Variables de entorno (backend)

| Variable | Descripción |
|----------|-------------|
| `NODE_ENV` | `development` o `production` |
| `PORT` | Puerto del servidor (default: 3000) |
| `FRONTEND_URL` | URL del frontend para CORS |
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto (default: 5432) |
| `DB_USER` | Usuario de BD |
| `DB_PASSWORD` | Contraseña de BD |
| `DB_NAME` | Nombre de la BD |
| `JWT_SECRET` | Secreto para firmar JWT |
| `JWT_EXPIRES_IN_SECONDS` | Expiración del token (default: 86400 = 1 día) |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google |
| `GOOGLE_CALLBACK_URL` | URL de callback OAuth |
