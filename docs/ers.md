# ERS — Especificación de Requisitos de Software

**Proyecto:** SGFIP — Sistema de Gestión de Flujo de Informes Patronales
**Cliente:** IGSS — Delegación Retalhuleu, área de Inspección Patronal
**Versión:** 1.0
**Fecha:** 26/05/2026

---

## 1. Introducción

### 1.1 Propósito
Este documento describe los requisitos funcionales y no funcionales del sistema SGFIP, cuyo objetivo es gestionar el flujo de informes patronales desde su creación hasta su finalización, con control de roles, tiempos y trazabilidad.

### 1.2 Alcance
Sistema web con frontend en HTML/CSS/JS vanilla y backend API REST en NestJS + TypeORM + PostgreSQL. Autenticación por JWT y Google OAuth2.

### 1.3 Convenciones
- **RF-** Requisito Funcional
- **RNF-** Requisito No Funcional
- **Estado:** ✅ Implementado | ⚠️ Parcial | ❌ No implementado | 🔄 En proceso

---

## 2. Actores del Sistema

| Actor | ID Rol | Descripción |
|-------|--------|-------------|
| Administrador | 1 | Acceso total: usuarios, informes, configuración, monitoreo |
| Inspector | 2 | Crea y gestiona informes, los envía a revisión |
| Supervisor | 3 | Revisa, aprueba o devuelve informes |

---

## 3. Requisitos Funcionales

### 3.1 Autenticación y Sesión

| ID | Nombre | Descripción | Actor | Estado | Cobertura en código |
|----|--------|-------------|-------|--------|---------------------|
| **RF-01** | Login local | El sistema debe autenticar usuarios con email y contraseña, retornando un JWT | Todos | ✅ Implementado | `auth.controller.ts:24` → `auth.service.ts:90` |
| **RF-02** | Login con Google OAuth | El sistema debe permitir autenticación mediante Google (redirect e ID token) | Todos | ✅ Implementado | `auth.controller.ts:29-44` → `auth.service.ts:25-55` |
| **RF-03** | Registro de usuario | El sistema debe permitir registro con nombre, email, contraseña y rol (Inspector/Supervisor) | Público | ✅ Implementado | `auth.controller.ts:18` → `auth.service.ts:57` |
| **RF-04** | Cierre de sesión | El sistema debe eliminar el token del lado del cliente | Todos | ✅ Implementado | `app.html:1398` |
| **RF-05** | Sesión persistente | El sistema debe ofrecer "Recordar sesión" (localStorage vs sessionStorage) | Todos | ✅ Implementado | `app.html:1310`, `login.html:426` |
| **RF-06** | Obtener usuario actual | El sistema debe exponer el usuario autenticado via JWT | Todos | ✅ Implementado | `auth.controller.ts:46` |

### 3.2 Roles y Permisos

| ID | Nombre | Descripción | Actor | Estado | Cobertura en código |
|----|--------|-------------|-------|--------|---------------------|
| **RF-07** | Roles diferenciados | El sistema debe distinguir 3 roles: Admin (1), Inspector (2), Supervisor (3) | Sistema | ✅ Implementado | `roles.guard.ts`, `roles.decorator.ts` |
| **RF-08** | Protección por rol | Cada endpoint debe validar que el usuario tenga el rol requerido | Sistema | ✅ Implementado | `RolesGuard` en cada controlador |
| **RF-09** | Menú dinámico por rol | El frontend debe mostrar solo las opciones según el rol del usuario | Todos | ✅ Implementado | `app.html:1294-1302` |

### 3.3 Gestión de Usuarios (Admin)

| ID | Nombre | Descripción | Actor | Estado | Cobertura en código |
|----|--------|-------------|-------|--------|---------------------|
| **RF-10** | Listar usuarios | El admin debe ver todos los usuarios del sistema | Admin | ✅ Implementado | `usuarios.controller.ts:25` |
| **RF-11** | Ver usuario por ID | El admin debe ver el detalle de cualquier usuario | Admin | ✅ Implementado | `usuarios.controller.ts:44` |
| **RF-12** | Crear usuario | El admin debe crear cuentas (nombre, email, passwordHash, rol, supervisorId) | Admin | ✅ Implementado | `usuarios.controller.ts:50` |
| **RF-13** | Editar usuario | El admin debe modificar datos de cualquier usuario | Admin | ✅ Implementado | `usuarios.controller.ts:67` |
| **RF-14** | Eliminar/desactivar usuario | El admin debe eliminar cuentas de usuarios | Admin | ✅ Implementado (delete físico) | `usuarios.controller.ts:77` |
| **RF-15** | Asignar jerarquía | El admin debe asignar un supervisor a cada inspector (supervisorId) | Admin | ✅ Implementado | `usuario.entity.ts:23` |
| **RF-16** | Listar inspectores activos | El sistema debe listar inspectores activos | Todos | ✅ Implementado | `usuarios.controller.ts:32` |
| **RF-17** | Listar supervisores activos | El sistema debe listar supervisores activos | Todos | ✅ Implementado | `usuarios.controller.ts:38` |
| **RF-18** | UI de gestión de usuarios | El admin debe tener una interfaz para gestionar usuarios desde el frontend | Admin | ⚠️ Parcial | Menú existe en sidebar pero no hay vista `view-usuarios` en `app.html` |

### 3.4 Gestión de Informes — Workflow

| ID | Nombre | Descripción | Actor | Estado | Cobertura en código |
|----|--------|-------------|-------|--------|---------------------|
| **RF-19** | Solicitar número de informe | El sistema debe generar un correlativo único INF-AAAA-NNNN sin intervención del usuario | Inspector, Admin | ✅ Implementado | `informes.service.ts:56-77` |
| **RF-20** | Correlativo anual incremental | El número debe incrementarse automáticamente por año: INF-2026-0001, INF-2026-0002... | Sistema | ✅ Implementado | `InformeSecuencia` + UPSERT |
| **RF-21** | Workflow de estados | El sistema debe gestionar: Pendiente → En Proceso → En Revisión → Finalizado / Devuelto | Sistema | ✅ Implementado | `informe-estados.ts` |
| **RF-22** | Iniciar proceso | El inspector puede iniciar el procesamiento de un informe Pendiente o Devuelto | Inspector | ✅ Implementado | `informes.controller.ts:73` |
| **RF-23** | Enviar a revisión | El inspector envía el informe completo a revisión del supervisor | Inspector | ✅ Implementado | `informes.controller.ts:84` |
| **RF-24** | Aprobar informe | El supervisor aprueba y finaliza el informe | Supervisor | ✅ Implementado | `informes.controller.ts:100` |
| **RF-25** | Devolver informe | El supervisor devuelve el informe al inspector con observación | Supervisor, Admin | ✅ Implementado | `informes.controller.ts:112` |
| **RF-26** | Validar transiciones | El sistema debe rechazar transiciones de estado inválidas | Sistema | ✅ Implementado | `informes.service.ts:111-157` |
| **RF-27** | Solo el inspector dueño puede modificar | Un inspector no puede modificar informes de otro inspector | Sistema | ✅ Implementado | `informes.service.ts:131` |
| **RF-28** | Autoasignación de supervisor | Al aprobar/devolver, el sistema asigna al supervisor actuante | Sistema | ✅ Implementado | `informes.service.ts:145` |
| **RF-29** | Campos del informe | El informe debe capturar: fecha, descripción, patrono, NIT, dirección, afiliación | Inspector | ✅ Implementado | `EnviarRevisionDto`, `informe.entity.ts` |
| **RF-30** | Campos de aprobación | Al aprobar: número de oficio, fecha de oficio, envío | Supervisor | ✅ Implementado | `AprobarInformeDto`, `informes.service.ts:198` |

### 3.5 Consulta y Filtros de Informes

| ID | Nombre | Descripción | Actor | Estado | Cobertura en código |
|----|--------|-------------|-------|--------|---------------------|
| **RF-31** | Listar todos los informes | El sistema debe listar informes con orden descendente por fecha | Admin, Supervisor | ✅ Implementado | `informes.controller.ts:44` |
| **RF-32** | Mis informes (inspector) | El inspector debe ver solo sus informes, filtrados por estado | Inspector | ✅ Implementado | `informes.controller.ts:57` |
| **RF-33** | Bandeja de supervisor | El supervisor debe ver informes pendientes de revisión | Supervisor, Admin | ✅ Implementado | `informes.controller.ts:50` |
| **RF-34** | Ver detalle de informe | Cualquier usuario autenticado debe ver el detalle completo de un informe | Todos | ✅ Implementado | `informes.controller.ts:67` |
| **RF-35** | Filtrar por estado | El sistema debe permitir filtrar informes por estado | Inspector | ✅ Implementado | `FiltrarInformesDto`, `informes.service.ts:95` |
| **RF-36** | Filtrar por inspector | El sistema debe permitir filtrar informes por inspector | Todos | ❌ No implementado | Solo filtro por estado existe |
| **RF-37** | Filtrar por rango de fechas | El sistema debe permitir filtrar por fecha de creación | Todos | ❌ No implementado | — |
| **RF-38** | Filtrar por nivel de urgencia | El sistema debe permitir filtrar por nivel de urgencia | Todos | ❌ No implementado | — |

### 3.6 Urgencia Automática

| ID | Nombre | Descripción | Actor | Estado | Cobertura en código |
|----|--------|-------------|-------|--------|---------------------|
| **RF-39** | Cálculo automático de urgencia | El sistema debe asignar urgencia según días transcurridos: 1-2d Baja, 3-5d Media, 6d+ Alta | Sistema | ❌ No implementado | Campo `nivel_urgencia` no existe en entidad |
| **RF-40** | Mostrar urgencia en listados | El nivel de urgencia debe ser visible en los listados y detalle | Todos | ❌ No implementado | — |

### 3.7 Bloqueo por Atraso

| ID | Nombre | Descripción | Actor | Estado | Cobertura en código |
|----|--------|-------------|-------|--------|---------------------|
| **RF-41** | Umbral configurable de atraso | El administrador debe poder configurar N (número de informes atrasados que bloquean) | Admin | ❌ No implementado | — |
| **RF-42** | Bloqueo automático | Si un inspector acumula N informes atrasados, no puede crear nuevos | Sistema | ❌ No implementado | — |
| **RF-43** | Notificar al supervisor | Al bloquear, el supervisor debe ser notificado | Sistema | ❌ No implementado | — |

### 3.8 Alertas y Escalamiento

| ID | Nombre | Descripción | Actor | Estado |
|----|--------|-------------|-------|--------|
| **RF-44** | Notificación por tiempo límite | El sistema debe notificar (correo + alerta en app) si un informe supera el límite de horas sin revisión | Sistema | ❌ No implementado |
| **RF-45** | Escalamiento automático | Si el supervisor no actúa en X horas sobre un informe crítico, escala al jefe inmediato superior | Sistema | ❌ No implementado |
| **RF-46** | Tiempo de alerta configurable | Admin debe configurar el límite de horas para alerta | Admin | ❌ No implementado |
| **RF-47** | Tiempo de escalamiento configurable | Admin debe configurar el límite de horas para escalamiento | Admin | ❌ No implementado |

### 3.9 Monitoreo y Métricas (Admin)

| ID | Nombre | Descripción | Actor | Estado | Cobertura en código |
|----|--------|-------------|-------|--------|---------------------|
| **RF-48** | Tiempos promedio por inspector | El sistema debe mostrar días promedio de procesamiento por inspector | Admin | ✅ Implementado | `admin.controller.ts:20` |
| **RF-49** | Tiempos promedio por supervisor | El sistema debe mostrar días promedio de revisión por supervisor | Admin | ✅ Implementado | `admin.controller.ts:44` |
| **RF-50** | Tiempos promedio globales | El sistema debe mostrar métricas generales del sistema | Admin | ✅ Implementado | `admin.controller.ts:69` |
| **RF-51** | Total de informes por estado | El sistema debe mostrar conteo de informes agrupados por estado | Admin | ❌ No implementado | — |
| **RF-52** | Inspectores con mayor atraso | El sistema debe identificar inspectores con más atraso | Admin | ❌ No implementado | — |
| **RF-53** | Tendencia semanal | El sistema debe mostrar tendencia de creación/finalización semanal | Admin | ❌ No implementado | — |
| **RF-54** | Exportar historial a Excel | El admin debe poder exportar los datos de monitoreo a Excel con filtros | Admin | ❌ No implementado | — |
| **RF-55** | Exportar historial a PDF | El admin debe poder exportar los datos de monitoreo a PDF con filtros | Admin | ❌ No implementado | — |

### 3.10 Administración de Secuencia

| ID | Nombre | Descripción | Actor | Estado |
|----|--------|-------------|-------|--------|
| **RF-56** | Anular números de informe | El admin debe poder marcar rangos de números como anulados/inutilizados | Admin | ❌ No implementado |
| **RF-57** | Reiniciar contador | El admin debe poder establecer desde qué número inicia el contador del año | Admin | ❌ No implementado |
| **RF-58** | Ver estado de secuencia | El admin debe poder ver el estado actual del contador por año | Admin | ❌ No implementado |

### 3.11 Auditoría

| ID | Nombre | Descripción | Actor | Estado |
|----|--------|-------------|-------|--------|
| **RF-59** | Registrar cambios de estado | Cada cambio de estado debe registrar: usuario, fecha, hora, estado anterior y nuevo | Sistema | ❌ No implementado |
| **RF-60** | Conservación mínima | Los registros de auditoría deben conservarse mínimo 1 año | Sistema | ❌ No implementado |

### 3.12 Parámetros Configurables

| ID | Nombre | Descripción | Actor | Estado |
|----|--------|-------------|-------|--------|
| **RF-61** | Umbral de bloqueo configurable | Admin puede modificar N informes atrasados para bloqueo | Admin | ❌ No implementado |
| **RF-62** | Tiempo de alerta configurable | Admin puede modificar horas límite para notificación | Admin | ❌ No implementado |
| **RF-63** | Tiempo de escalamiento configurable | Admin puede modificar horas para escalar alerta | Admin | ❌ No implementado |

### 3.13 Health Check

| ID | Nombre | Descripción | Actor | Estado | Cobertura en código |
|----|--------|-------------|-------|--------|---------------------|
| **RF-64** | Endpoint de salud | El sistema debe exponer un endpoint `/api/health` que indique estado del servidor | Público | ✅ Implementado | `health.controller.ts` |
| **RF-65** | Verificar base de datos | El health check debe verificar conectividad con PostgreSQL | Público | ❌ No implementado | Solo retorna `{status: "ok"}` |

---

## 4. Requisitos No Funcionales

| ID | Nombre | Descripción | Estado | Cobertura en código |
|----|--------|-------------|--------|---------------------|
| **RNF-01** | Seguridad — Helmet | El sistema debe incluir headers HTTP de seguridad (XSS, content-type sniffing, clickjacking) | ✅ Implementado | `main.ts:35` |
| **RNF-02** | Seguridad — CORS | El sistema debe restringir CORS al frontend autorizado en producción | ✅ Implementado | `main.ts:67-71` |
| **RNF-03** | Seguridad — Rate limiting | El sistema debe limitar solicitudes: 20/15min en auth, 200/min global | ✅ Implementado | `main.ts:38-64` |
| **RNF-04** | Seguridad — JWT | El sistema debe usar JWT con expiración configurable para sesiones | ✅ Implementado | `jwt.strategy.ts`, `auth.service.ts:134` |
| **RNF-05** | Seguridad — Contraseñas hasheadas | Las contraseñas deben almacenarse con bcrypt (10 rondas) | ✅ Implementado | `auth.service.ts:69` |
| **RNF-06** | Seguridad — Validación de entrada | El sistema debe validar y sanitizar todos los inputs (whitelist + forbidNonWhitelisted) | ✅ Implementado | `main.ts:24-30`, DTOs con class-validator |
| **RNF-07** | Seguridad — SQL Injection | El sistema debe usar consultas parametrizadas | ⚠️ Parcial | Admin controller usa `query()` con interpolación |
| **RNF-08** | Seguridad — XSS frontend | El frontend debe sanitizar datos antes de renderizar | ❌ No implementado | `app.html` usa `innerHTML` extensivamente |
| **RNF-09** | Seguridad — SSL/TLS | La conexión a BD debe usar SSL con verificación de certificado | ⚠️ Parcial | `rejectUnauthorized: false` (no verifica) |
| **RNF-10** | Disponibilidad — Health check | El sistema debe exponer estado del servidor | ✅ Implementado | `health.controller.ts` |
| **RNF-11** | Disponibilidad — Validación de entorno | El sistema debe validar variables críticas al iniciar | ❌ No implementado | No hay verificación de JWT_SECRET, DB_PASSWORD, etc. |
| **RNF-12** | Mantenibilidad — Logging | El sistema debe tener logging estructurado para producción | ❌ No implementado | — |
| **RNF-13** | Mantenibilidad — Migraciones | La BD debe gestionarse con migraciones (no synchronize en prod) | ⚠️ Parcial | Migraciones SQL existen, pero no TypeORM migrations |
| **RNF-14** | Mantenibilidad — Tests | El sistema debe tener pruebas automatizadas | ⚠️ Parcial | Solo 1 test e2e, sin unit tests |
| **RNF-15** | Configuración — Variables de entorno | Los valores configurables deben obtenerse de variables de entorno | ✅ Implementado | `env.configuration.ts` |
| **RNF-16** | Frontend — URL backend configurable | La URL del backend debe ser configurable sin modificar código | ⚠️ Parcial | `config.js` tiene lógica de detección pero URL hardcodeada como fallback |

---

## 5. Matriz de Trazabilidad (ERS vs Código)

### 5.1 Resumen por estado

| Estado | Cantidad | % |
|--------|----------|---|
| ✅ Implementado | 34 | 47% |
| ⚠️ Parcial | 6 | 8% |
| ❌ No implementado | 32 | 45% |
| **Total** | **72** | **100%** |

### 5.2 Por módulo

| Módulo | RF totales | ✅ | ⚠️ | ❌ |
|--------|-----------|----|-----|-----|
| Autenticación | 6 | 6 | 0 | 0 |
| Roles y permisos | 3 | 3 | 0 | 0 |
| Gestión de usuarios | 9 | 8 | 1 | 0 |
| Informes — Workflow | 12 | 12 | 0 | 0 |
| Consulta y filtros | 8 | 4 | 0 | 4 |
| Urgencia automática | 2 | 0 | 0 | 2 |
| Bloqueo por atraso | 3 | 0 | 0 | 3 |
| Alertas y escalamiento | 4 | 0 | 0 | 4 |
| Monitoreo y métricas | 8 | 3 | 0 | 5 |
| Secuencia de informes | 3 | 0 | 0 | 3 |
| Auditoría | 2 | 0 | 0 | 2 |
| Parámetros configurables | 3 | 0 | 0 | 3 |
| Health check | 2 | 1 | 0 | 1 |
| No funcionales | 16 | 9 | 4 | 3 |

---

## 6. Glosario

| Término | Definición |
|---------|------------|
| Informe patronal | Documento que registra una inspección a un patrono (empresa) |
| Correlativo | Número único de informe en formato INF-AAAA-NNNN |
| JWT | JSON Web Token, usado para autenticación stateless |
| Rol | Permiso asignado a un usuario (Admin, Inspector, Supervisor) |
| Workflow | Secuencia de estados por los que pasa un informe |
| UPSERT | Operación SQL que actualiza o inserta según exista conflicto |

---

## 7. Historial de Cambios

| Versión | Fecha | Descripción | Autor |
|---------|-------|-------------|-------|
| 1.0 | 26/05/2026 | Versión inicial — levantado desde código + requisitos del negocio | — |
