# Plan de Pruebas — SGFIP

**Proyecto:** SGFIP — Sistema de Gestión de Flujo de Informes Patronales
**Versión:** 1.0
**Fecha:** 26/05/2026
**Referencia:** ERS v1.0 (`docs/ers.md`)

---

## 1. Objetivo

Validar que el sistema cumple con los requisitos funcionales (RF) y no funcionales (RNF) especificados en el ERS, previo al despliegue a producción.

---

## 2. Alcance

### 2.1 Dentro del alcance
- Pruebas funcionales de todos los módulos (Auth, Usuarios, Informes, Admin, Health)
- Pruebas de seguridad (autenticación, autorización, rate limiting, CORS)
- Pruebas de base de datos (migraciones, integridad, secuencias)
- Pruebas de frontend (flujos principales)
- Pruebas de configuración y entorno

### 2.2 Fuera del alcance (Fase 1)
- Notificaciones por correo
- Escalamiento automático
- Exportación Excel/PDF
- Bloqueo por atraso
- Pruebas de carga/estrés

---

## 3. Estrategia de pruebas

| Tipo | Enfoque | Automatización | Prioridad |
|------|---------|----------------|-----------|
| Smoke | Manual + Script | Manual | Alta |
| Integración API | Suite automatizada con Jest + Supertest | Automatizada | Alta |
| Seguridad | Manual con herramientas | Manual | Alta |
| Base de datos | Scripts SQL + verificación | Semi-automatizada | Alta |
| Frontend | Manual (navegador) | Manual | Media |
| Configuración | Manual + scripts | Manual | Alta |

---

## 4. Casos de Prueba

### 4.1 Smoke Tests (S)

| ID | Descripción | Pasos | Resultado esperado | RF/RNF |
|----|-------------|-------|-------------------|--------|
| S-01 | Servidor inicia correctamente | `npm run start:dev` | Servidor escucha en puerto 3000 sin errores | RNF-11 |
| S-02 | Health check responde | `GET /api/health` | `{status: "ok", environment, timestamp}` | RF-64 |
| S-03 | Login con credenciales válidas | POST `/api/auth/login` con email+password correctos | Retorna `200` con `accessToken` | RF-01 |
| S-04 | Login con credenciales inválidas | POST `/api/auth/login` con password incorrecto | Retorna `401` | RF-01 |

### 4.2 Autenticación (A)

| ID | Descripción | Pasos | Resultado esperado | RF |
|----|-------------|-------|-------------------|-----|
| A-01 | Registro exitoso | POST `/api/auth/register` con datos válidos | Retorna `201` con JWT | RF-03 |
| A-02 | Registro con email duplicado | POST `/api/auth/register` con email existente | Retorna `409 Conflict` | RF-03 |
| A-03 | Registro con datos inválidos (email mal formado) | POST con email inválido | Retorna `400` | RNF-06 |
| A-04 | Registro con password < 6 caracteres | POST con password corta | Retorna `400` | RNF-06 |
| A-05 | Login usuario inactivo | Desactivar usuario, intentar login | Retorna `401` con code `USER_INACTIVE` | RF-01 |
| A-06 | Login usuario sin contraseña local (solo Google) | Intentar login local en usuario Google-only | Retorna `401` con code `INVALID_PASSWORD` | RF-01 |
| A-07 | Obtener perfil actual (`/me`) con token válido | GET `/api/auth/me` con Bearer token | Retorna `200` con datos del usuario | RF-06 |
| A-08 | Obtener perfil sin token | GET `/api/auth/me` sin header | Retorna `401` | RF-06 |
| A-09 | Obtener perfil con token expirado | GET `/api/auth/me` con token vencido | Retorna `401` | RNF-04 |

### 4.3 Roles y Permisos (R)

| ID | Descripción | Pasos | Resultado esperado | RF |
|----|-------------|-------|-------------------|-----|
| R-01 | Admin accede a endpoint de admin | GET `/api/auth/admin` como admin | Retorna `200` | RF-07, RF-08 |
| R-02 | Inspector no accede a endpoint de admin | GET `/api/auth/admin` como inspector | Retorna `403` | RF-07, RF-08 |
| R-03 | Supervisor no accede a endpoint de admin | GET `/api/auth/admin` como supervisor | Retorna `403` | RF-07, RF-08 |
| R-04 | Inspector crea informe | POST `/api/informes` como inspector | Retorna `201` | RF-19 |
| R-05 | Supervisor no crea informe | POST `/api/informes` como supervisor | Retorna `403` | RF-19 |
| R-06 | Admin ve listado de usuarios | GET `/api/usuarios` como admin | Retorna `200` | RF-10 |
| R-07 | Inspector no ve listado de usuarios | GET `/api/usuarios` como inspector | Retorna `403` | RF-10 |
| R-08 | Admin aprueba informe (rol 1 puede todo) | PATCH `/api/informes/:id/aprobar` como admin | Retorna `200` (si es supervisor asignado) | RF-24 |

### 4.4 Usuarios (U)

| ID | Descripción | Pasos | Resultado esperado | RF |
|----|-------------|-------|-------------------|-----|
| U-01 | Admin lista todos los usuarios | GET `/api/usuarios` | Array de usuarios | RF-10 |
| U-02 | Admin crea usuario | POST `/api/usuarios` con datos válidos | Retorna `201` | RF-12 |
| U-03 | Admin edita usuario | PATCH `/api/usuarios/:id` con cambios | Retorna `200` con datos actualizados | RF-13 |
| U-04 | Admin elimina usuario | DELETE `/api/usuarios/:id` | Retorna `200` con mensaje | RF-14 |
| U-05 | Listar inspectores activos | GET `/api/usuarios/inspectores` | Solo usuarios con rol 2 y activo | RF-16 |
| U-06 | Listar supervisores activos | GET `/api/usuarios/supervisores` | Solo usuarios con rol 3 y activo | RF-17 |
| U-07 | Admin asigna supervisor a inspector | PATCH `/api/usuarios/:id` con `supervisorId` | Se actualiza correctamente | RF-15 |

### 4.5 Informes — Workflow (I)

| ID | Descripción | Pasos | Resultado esperado | RF |
|----|-------------|-------|-------------------|-----|
| I-01 | Solicitar número de informe | POST `/api/informes` | Retorna `201` con `numeroInforme: "INF-2026-NNNN"` | RF-19 |
| I-02 | Correlativo es incremental | Solicitar 2 informes seguidos | Números consecutivos: `INF-2026-0001`, `INF-2026-0002` | RF-20 |
| I-03 | Iniciar proceso (Pendiente → En Proceso) | PATCH `/api/informes/:id/iniciar` como inspector dueño | Estado cambia a "En Proceso" | RF-22 |
| I-04 | Enviar a revisión (En Proceso → En Revisión) | PATCH `/api/informes/:id/enviar-revision` con datos completos | Estado cambia a "En Revisión", datos guardados | RF-23 |
| I-05 | Aprobar informe (En Revisión → Finalizado) | PATCH `/api/informes/:id/aprobar` como supervisor | Estado cambia a "Finalizado" | RF-24 |
| I-06 | Devolver informe (En Revisión → Devuelto) | PATCH `/api/informes/:id/devolver` con observación | Estado cambia a "Devuelto" | RF-25 |
| I-07 | Reanudar desde devuelto (Devuelto → En Proceso) | PATCH `/api/informes/:id/iniciar` después de devuelto | Estado cambia a "En Proceso" y observación se limpia | RF-22 |
| I-08 | Transición inválida (Pendiente → Finalizado) | Intentar aprobar informe en estado Pendiente | Retorna `400` | RF-26 |
| I-09 | Transición inválida (Finalizado → cualquier estado) | PATCH sobre informe Finalizado | Retorna `400` | RF-26 |
| I-10 | Inspector no modifica informe ajeno | Inspector A intenta iniciar informe de Inspector B | Retorna `403` | RF-27 |
| I-11 | Supervisor no aprueba su propio informe | Supervisor trata de aprobar informe donde él es inspector | Retorna `403` | RF-27 |
| I-12 | Autoasignación de supervisor | Supervisor aprueba informe | `supervisorId` se asigna automáticamente | RF-28 |

### 4.6 Consulta y Filtros (F)

| ID | Descripción | Pasos | Resultado esperado | RF |
|----|-------------|-------|-------------------|-----|
| F-01 | Admin/supervisor lista todos los informes | GET `/api/informes` | Array completo ordenado por fecha DESC | RF-31 |
| F-02 | Inspector ve solo sus informes pendientes | GET `/api/informes/mis-informes?estado=Pendiente` | Solo informes del inspector en estado Pendiente | RF-32 |
| F-03 | Supervisor ve bandeja de revisión | GET `/api/informes/en-revision` | Solo informes en "En Revisión" | RF-33 |
| F-04 | Ver detalle de informe | GET `/api/informes/:id` | Objeto completo con todos los campos | RF-34 |
| F-05 | Filtrar informes por inspector | GET `/api/informes?inspectorId=N` | Solo informes del inspector indicado | RF-36 |
| F-06 | Filtrar informes por rango de fechas | GET `/api/informes?fechaInicio=X&fechaFin=Y` | Solo informes en el rango | RF-37 |
| F-07 | Filtrar informes por urgencia | GET `/api/informes?urgencia=alta` | Solo informes con urgencia Alta | RF-38 |

> **Nota:** F-05, F-06, F-07 no están implementados. Se marcarán como fallidos hasta su desarrollo en Fase 1.

### 4.7 Urgencia Automática (U)

| ID | Descripción | Pasos | Resultado esperado | RF |
|----|-------------|-------|-------------------|-----|
| U-01 | Urgencia Baja (1-2 días) | Crear informe con fecha actual | Urgencia = "Baja" | RF-39 |
| U-02 | Urgencia Media (3-5 días) | Crear informe con fecha hace 4 días | Urgencia = "Media" | RF-39 |
| U-03 | Urgencia Alta (6+ días) | Crear informe con fecha hace 7 días | Urgencia = "Alta" | RF-39 |
| U-04 | Urgencia visible en listado | Consultar listado de informes | Columna "Urgencia" visible | RF-40 |
| U-05 | Urgencia visible en detalle | Consultar detalle de informe | Campo "Urgencia" visible | RF-40 |

> **Nota:** U-01 a U-05 no están implementados. Se marcarán como fallidos hasta su desarrollo en Fase 1.

### 4.8 Monitoreo (M)

| ID | Descripción | Pasos | Resultado esperado | RF |
|----|-------------|-------|-------------------|-----|
| M-01 | Tiempos por inspector | GET `/api/admin/tiempos/inspectores` | Array con inspector_id, nombre, total, promedio, total días | RF-48 |
| M-02 | Tiempos por supervisor | GET `/api/admin/tiempos/supervisores` | Array con supervisor_id, nombre, total, promedio, total días | RF-49 |
| M-03 | Tiempos generales | GET `/api/admin/tiempos/general` | Objeto con total finalizados, promedios globales | RF-50 |
| M-04 | No-admin no accede a monitoreo | GET `/api/admin/tiempos/inspectores` como inspector | Retorna `403` | R-02 |

### 4.9 Seguridad (SEC)

| ID | Descripción | Pasos | Resultado esperado | RNF |
|----|-------------|-------|-------------------|-----|
| SEC-01 | Rate limiting en auth | 25 requests rápidas a POST `/api/auth/login` | Request 21+ retorna `429` | RNF-03 |
| SEC-02 | Rate limiting global | 210 requests rápidas a GET `/api/health` | Request 201+ retorna `429` | RNF-03 |
| SEC-03 | CORS bloquea origen no autorizado | GET `/api/health` con `Origin: https://evil.com` | Sin header `Access-Control-Allow-Origin` | RNF-02 |
| SEC-04 | SQL Injection en campos de texto | POST `/api/informes/:id/enviar-revision` con `'; DROP TABLE informes; --` en nombrePatrono | La consulta NO se ejecuta, retorna error controlado | RNF-07 |
| SEC-05 | XSS en observación | POST con `<script>alert('xss')</script>` en observación | Frontend renderiza como texto, NO ejecuta script | RNF-08 |
| SEC-06 | Helmet headers presentes | GET `/api/health` | Headers: X-XSS-Protection, X-Content-Type-Options, X-Frame-Options | RNF-01 |
| SEC-07 | JWT manipulado | GET `/api/auth/me` con token alterado | Retorna `401` | RNF-04 |
| SEC-08 | Token sin expiración | GET con token que nunca expira | Debe respetar `exp` del payload | RNF-04 |

### 4.10 Base de Datos (BD)

| ID | Descripción | Pasos | Resultado esperado | RF/RNF |
|----|-------------|-------|-------------------|--------|
| BD-01 | Ejecutar migración producción | Ejecutar `production-migration.sql` en BD limpia | Tablas: usuarios, informes, informe_secuencia creadas con columnas correctas | RNF-13 |
| BD-02 | Índices creados | Verificar índices | Existen: idx_informes_estado, idx_informes_inspector, idx_informes_numero, idx_usuarios_email, idx_usuarios_rol | RNF-13 |
| BD-03 | Secuencia atómica | 2 solicitudes de informe concurrentes | Números distintos sin condición de carrera | RF-20 |
| BD-04 | sincronize=false en producción | Arrancar con NODE_ENV=production | Tablas no se modifican automáticamente | RNF-13 |

### 4.11 Frontend (FE)

| ID | Descripción | Pasos | Resultado esperado | RF |
|----|-------------|-------|-------------------|-----|
| FE-01 | Inicio de sesión exitoso | Ingresar credenciales correctas | Redirige a `app.html` con sesión activa | RF-01 |
| FE-02 | Menú por rol | Iniciar como inspector | Solo ve: Inicio, Mi cola, Nuevo informe | RF-09 |
| FE-03 | Menú admin | Iniciar como admin | Ve: Inicio, Informes, Nuevo informe, Monitoreo, Usuarios | RF-09 |
| FE-04 | Menú supervisor | Iniciar como supervisor | Ve: Inicio, Bandeja, Informes | RF-09 |
| FE-05 | Solicitar informe desde UI | Click en "Generar Número" | Modal de éxito con número generado | RF-19 |
| FE-06 | Copiar número al portapapeles | Click en "Copiar número" en modal | Número copiado + toast de confirmación | RF-19 |
| FE-07 | Ver cola de trabajo (inspector) | Ir a "Mi cola de trabajo" | Tabs: Pendientes, En Proceso, Devueltos | RF-32 |
| FE-08 | Iniciar informe desde UI | Click "Iniciar" en Pendiente | Estado cambia, recarga la cola | RF-22 |
| FE-09 | Enviar a revisión desde UI | Click "Enviar a revisión" en En Proceso | Modal con formulario, al enviar cambia estado | RF-23 |
| FE-10 | Bandeja de supervisor | Ir a "Bandeja de supervisor" | Lista informes en revisión con botones Aprobar/Devolver | RF-33 |
| FE-11 | Aprobar desde UI | Click "Aprobar" → llenar campos → confirmar | Informe finalizado | RF-24 |
| FE-12 | Devolver desde UI | Click "Devolver" → escribir observación → confirmar | Informe devuelto | RF-25 |
| FE-13 | Ver detalle de informe | Click "Ver detalle" | Modal con todos los campos del informe | RF-34 |
| FE-14 | Cerrar sesión | Click "Cerrar sesión" | Redirige a login con toast "Sesión cerrada" | RF-04 |
| FE-15 | Sesión persistente | Marcar "Recordar sesión" y recargar navegador | Sesión activa después de recargar | RF-05 |

### 4.12 Configuración y Entorno (C)

| ID | Descripción | Pasos | Resultado esperado | RNF |
|----|-------------|-------|-------------------|-----|
| C-01 | Arrancar sin JWT_SECRET | Iniciar servidor sin variable JWT_SECRET | Error claro al iniciar | RNF-11 |
| C-02 | Arrancar con NODE_ENV=production | Iniciar con variable de entorno production | sincronize=false, SSL activado, CORS restringido | RNF-02, RNF-09, RNF-13 |
| C-03 | FRONTEND_URL incorrecta en producción | Request desde URL no autorizada | CORS bloquea la solicitud | RNF-02 |
| C-04 | Frontend detecta entorno | Abrir app.html desde localhost | API apunta a localhost:3000 | RNF-16 |

---

## 5. Prioridades de Ejecución

### Fase A — Smoke + Integración crítica (PRE-FASE 1)
| Orden | Pruebas | Tiempo estimado |
|-------|---------|-----------------|
| 1 | S-01 a S-04 (Smoke) | 5 min |
| 2 | A-01 a A-09 (Auth) | 15 min |
| 3 | R-01 a R-08 (Roles) | 10 min |
| 4 | I-01 a I-12 (Workflow informes) | 20 min |
| 5 | SEC-01, SEC-03, SEC-06, SEC-07 (Seguridad básica) | 10 min |

### Fase B — Funcionalidades completas (POST-FASE 1)
| Orden | Pruebas | Tiempo estimado |
|-------|---------|-----------------|
| 6 | U-01 a U-07 (Usuarios) | 10 min |
| 7 | F-01 a F-07 (Filtros) | 10 min |
| 8 | M-01 a M-04 (Monitoreo) | 5 min |
| 9 | BD-01 a BD-04 (Base de datos) | 15 min |
| 10 | C-01 a C-04 (Configuración) | 10 min |

### Fase C — Frontend + Seguridad avanzada (PRE-DEPLOY)
| Orden | Pruebas | Tiempo estimado |
|-------|---------|-----------------|
| 11 | FE-01 a FE-15 (Frontend) | 30 min |
| 12 | SEC-02, SEC-04, SEC-05, SEC-08 (Seguridad avanzada) | 15 min |

---

## 6. Criterios de Aceptación para Producción

### 6.1 Criterios BLOQUEANTES (GO/NO-GO)
- Todos los smoke tests (S-01 a S-04) pasan
- Todos los tests de autenticación (A-01 a A-09) pasan
- Workflow completo de informes (I-01 a I-12) pasa
- Roles y permisos (R-01 a R-08) pasan
- Rate limiting (SEC-01) funciona
- Secuencia correlativa (I-02) es atómica y correcta

### 6.2 Criterios NO BLOQUEANTES (pueden pasar después)
- Tests de frontend visuales
- Exportación Excel/PDF
- Notificaciones y escalamiento
- Tests de carga

---

## 7. Herramientas

| Propósito | Herramienta | Versión |
|-----------|-------------|---------|
| Pruebas de API (automatizadas) | Jest + Supertest | Jest 30+ |
| Pruebas de API (manuales) | Postman / curl | — |
| Pruebas de frontend | Navegador (Chrome/Edge) | — |
| Pruebas de BD | psql / consola Neon | — |
| Pruebas de seguridad | curl + navegador DevTools | — |

---

## 8. Reporte de Resultados

Cada caso de prueba se documentará con:
- **ID** del caso
- **Estado:** ✅ Pass / ❌ Fail / ⚠️ Bloqueado
- **Evidencia:** Captura, log o respuesta de API
- **Observación:** Notas sobre el resultado
- **RF asociado:** Referencia al ERS

---

## 9. Historial de Cambios

| Versión | Fecha | Descripción | Autor |
|---------|-------|-------------|-------|
| 1.0 | 26/05/2026 | Versión inicial alineada con ERS v1.0 | — |
