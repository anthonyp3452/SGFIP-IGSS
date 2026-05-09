# SGFIP — Backend API

API REST del Sistema de Gestión de Flujo de Informes Patronales.

## Stack

- NestJS 11 + TypeScript
- TypeORM + PostgreSQL
- Passport.js (JWT + Google OAuth2)

## Scripts

| Comando             | Descripción                    |
|---------------------|--------------------------------|
| `npm run start:dev` | Desarrollo con hot-reload      |
| `npm run build`     | Compilar TypeScript            |
| `npm run start:prod`| Producción                     |
| `npm test`          | Pruebas unitarias              |
| `npm run test:e2e`  | Pruebas end-to-end             |
| `npm run lint`      | Linter                         |

## Variables de entorno

Copiar `.env.example` a `.env` y configurar:

```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
JWT_SECRET
```

## Endpoints

| Método | Ruta                    | Auth     | Descripción            |
|--------|-------------------------|----------|------------------------|
| GET    | /api/health             | No       | Health check           |
| POST   | /api/auth/google        | No       | Login con Google ID    |
| GET    | /api/auth/google        | Google   | Iniciar OAuth2 Google  |
| GET    | /api/auth/google/callback | Google | Callback OAuth2        |
| GET    | /api/auth/me            | JWT      | Perfil actual          |
| GET    | /api/usuarios           | No       | Listar usuarios        |
| GET    | /api/usuarios/:id       | No       | Usuario por ID         |
