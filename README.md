# SGFIP — Sistema de Gestión de Flujo de Informes Patronales

Sistema para el IGSS — Delegación Retalhuleu, área de Inspección Patronal.

## Estructura del proyecto

```
sgfip/
├── frontend/              # Aplicación web (HTML + CSS + JS vanilla)
│   ├── login.html         # Pantalla de inicio de sesión
│   ├── app.html           # Aplicación principal post-login
│   └── js/
│       └── toast.js       # Sistema de notificaciones visuales
├── backend/               # API REST (NestJS + TypeScript + PostgreSQL)
│   ├── src/
│   │   ├── config/        # Configuración de entorno y base de datos
│   │   ├── modules/
│   │   │   ├── auth/      # Autenticación (JWT, Google OAuth2)
│   │   │   ├── health/    # Endpoint de monitoreo
│   │   │   └── usuarios/  # CRUD de usuarios
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript vanilla
- **Backend:** NestJS 11, TypeScript, TypeORM, Passport.js
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT + Google OAuth2

## Requisitos

- Node.js >= 18
- PostgreSQL
- NestJS CLI (opcional)

## Instalación y ejecución

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend (servir con cualquier servidor estático)
# Ej: npx serve frontend
```

## Roles

| Rol         | ID | Acceso                                |
|-------------|----|---------------------------------------|
| Admin       | 1  | Todo el sistema                       |
| Inspector   | -  | Informes, inspecciones, consulta      |
| Consulta    | -  | Solo consulta pública                 |
