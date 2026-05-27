# Análisis del Proyecto SGFIP — Pre-Producción

**Fecha:** 26/05/2026
**Propósito:** Revisión integral del código antes del despliegue a producción.

---

## 🔴 Críticos (resolver antes de producción)

| # | Problema | Detalle |
|---|----------|---------|
| 1 | **Credenciales reales en `.env`** | Google OAuth Client ID + Secret, JWT Secret y DB password están expuestos en `backend/.env`. Si el repo es o fue público, **rotar inmediatamente**. |
| 2 | **`.env` podría estar en git** | Aunque `.gitignore` lo excluye, hay que verificar con `git status` que no haya sido commiteado antes. |
| 3 | **Esquema inconsistente BD vs Entidad** | La migración SQL (`production-migration.sql`) define `nombre_patrono` y `nit_patrono` como `NOT NULL`, pero la entidad TypeORM los tiene como `nullable: true`. La migración `002_informes_tipo_inspeccion.sql` agrega `tipo_inspeccion` que **no existe en la entidad**. |

---

## 🟡 Importantes

| # | Problema | Detalle |
|---|----------|---------|
| 4 | **SQL Injection surface** | `admin.controller.ts` usa `query()` con concatenación de columnas. |
| 5 | **XSS en frontend** | `app.html` usa `innerHTML` extensivamente para renderizar datos de usuarios. |
| 6 | **URL de backend hardcodeada** | `frontend/js/config.js` línea 19: `https://sgfip-back.onrender.com` fijo. |
| 7 | **SSL sin verificar certificado** | `rejectUnauthorized: false` — acepta cualquier certificado (man-in-the-middle). |
| 8 | **Sin validación de entorno al iniciar** | No se verifica que `JWT_SECRET`, `DB_PASSWORD`, etc. estén configurados. |
| 9 | **Health check no verifica BD** | Solo responde `{status: "ok"}`, no verifica conectividad con PostgreSQL. |
| 10 | **Sin logging estructurado** | En producción no hay forma de debuggear errores fácilmente. |

---

## 🟢 Menores / Recomendaciones

| # | Problema | Detalle |
|---|----------|---------|
| 11 | **Sin migraciones TypeORM** | Solo raw SQL + `synchronize: true` en dev. No hay `typeorm migration:generate`. |
| 12 | **Rate limits hardcodeados** | 20/15min en auth, 200/min global — están fijos en `main.ts`. |
| 13 | **No hay tests unitarios (solo e2e)** | Solo hay `app.e2e-spec.ts`, no hay spec por módulo. |
| 14 | **No hay archivo `backend/.env.example` en el repo** | Sí existe en el FS, verificar que esté trackeado. |

---

## 📁 Resumen de Arquitectura

| Componente | Tecnología | Despliegue |
|------------|-----------|------------|
| **Frontend** | HTML + CSS + Vanilla JS | Vercel (estático) |
| **Backend** | NestJS 11 + TypeORM + Passport | Render (Node) |
| **BD** | PostgreSQL | Neon (serverless) |
| **Auth** | JWT + Google OAuth2 | — |
| **Rate Limit** | express-rate-limit + helmet | — |

### Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login local (email + password) |
| POST | `/api/auth/register` | Registro de usuario (rol 2 o 3) |
| POST | `/api/auth/google` | Login con Google ID token |
| GET | `/api/auth/google` | Iniciar flujo OAuth2 de Google |
| GET | `/api/auth/google/callback` | Callback OAuth2 de Google |
| GET | `/api/auth/me` | Obtener usuario actual desde JWT |
| GET | `/api/usuarios` | Listar usuarios (solo admin) |
| GET | `/api/usuarios/inspectores` | Listar inspectores activos |
| GET | `/api/usuarios/supervisores` | Listar supervisores activos |
| POST | `/api/usuarios` | Crear usuario (solo admin) |
| PATCH | `/api/usuarios/:id` | Actualizar usuario (solo admin) |
| DELETE | `/api/usuarios/:id` | Eliminar usuario (solo admin) |
| POST | `/api/informes` | Solicitar nuevo número de informe |
| GET | `/api/informes` | Listar informes |
| GET | `/api/informes/en-revision` | Informes en revisión (admin/supervisor) |
| GET | `/api/informes/mis-informes` | Informes del usuario autenticado |
| GET | `/api/informes/:id` | Detalle de un informe |
| PATCH | `/api/informes/:id/iniciar` | Iniciar procesamiento (inspector) |
| PATCH | `/api/informes/:id/enviar-revision` | Enviar a revisión (inspector) |
| PATCH | `/api/informes/:id/aprobar` | Aprobar y finalizar (supervisor) |
| PATCH | `/api/informes/:id/devolver` | Devolver a inspector (admin/supervisor) |
| GET | `/api/admin/tiempos/inspectores` | Tiempos promedio por inspector (admin) |
| GET | `/api/admin/tiempos/supervisores` | Tiempos promedio por supervisor (admin) |
| GET | `/api/admin/tiempos/general` | Tiempos promedio globales (admin) |
| GET | `/api/health` | Health check |

### Workflow de informes

```
Pendiente → En Proceso → En Revisión → Finalizado
                ↑              ↓
                └── Devuelto ←─┘
```

### Roles del sistema

| Rol | ID | Acceso |
|-----|----|--------|
| Admin | 1 | Todo el sistema |
| Inspector | 2 | Informes, inspecciones, consulta |
| Supervisor / Consulta | 3 | Solo consulta / revisión |

---

## 📂 Estructura del proyecto

```
sgfip/
├── frontend/
│   ├── login.html
│   ├── register.html
│   ├── app.html
│   ├── images/
│   │   └── logo.jpg
│   └── js/
│       ├── config.js
│       └── toast.js
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   │   ├── env.configuration.ts
│   │   │   └── database.config.ts
│   │   └── modules/
│   │       ├── auth/      (controller, service, guards, strategies, DTOs)
│   │       ├── usuarios/  (controller, service, entity)
│   │       ├── informes/  (controller, service, entities, DTOs, const)
│   │       ├── admin/     (controller, module)
│   │       └── health/    (controller, service, module)
│   ├── sql/
│   │   ├── 001_informe_secuencia.sql
│   │   ├── 002_informes_tipo_inspeccion.sql
│   │   ├── 003_informe_campos_workflow.sql
│   │   └── production-migration.sql
│   ├── test/
│   │   └── app.e2e-spec.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── Procfile
├── .gitignore
└── README.md
```

---

## 🔐 Seguridad

### Fortalezas
- Helmet habilitado (XSS, content-type sniffing, clickjacking)
- CORS restringido por origen en producción
- Rate limiting en rutas de auth (20/15min) y global (200/min)
- Validación de entrada con `class-validator` + `whitelist` + `forbidNonWhitelisted`
- Contraseñas hasheadas con bcryptjs (10 rondas)
- JWT con expiración configurable

### Debilidades
- SQL injection surface en admin controller (raw queries)
- XSS por `innerHTML` en frontend
- SSL sin verificación de certificado (`rejectUnauthorized: false`)
- Sin validación de variables de entorno al iniciar
- Sin CSRF (aceptable para SPA con Bearer token, pero documentado)

---

## 📋 Plan de Acción Sugerido

1. **Rotar credenciales** (Google OAuth, JWT secret)
2. **Verificar `.env` no esté en git** (`git rm --cached .env` si es necesario)
3. **Sincronizar entidad TypeORM con SQL** (agregar `tipo_inspeccion` a la entidad, corregir nullability)
4. **Mejorar seguridad**: Sanitizar frontend (usar `textContent`), parametrizar queries admin
5. **Configuración**: Hacer que `config.js` use variable de entorno inyectada por Vercel/Render
6. **Agregar validación de entorno al iniciar** y logging estructurado
7. **Corregir health check** para verificar conectividad con BD
8. **Agregar tests unitarios** por módulo
