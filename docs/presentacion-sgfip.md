# SGFIP — Sistema de Gestión de Flujo de Informes Patronales

**IGSS — Delegación Retalhuleu**  
**Curso:** Ingeniería de Software  
**Tecnologías:** NestJS + PostgreSQL + Vanilla JS

---

## 1. Problema / Contexto

- **Situación actual:** Procesos manuales en papel para gestión de informes patronales
- **Problemas:** Pérdida de documentos, sin trazabilidad, reprocesos, sin métricas de rendimiento
- **Actores involucrados:** Inspectores, supervisores, administradores
- **Volumen estimado:** ~20–50 informes por inspector al mes

---

## 2. Objetivos

- Digitalizar el flujo completo del informe patronal
- Eliminar el papeleo y la pérdida de documentos
- Proveer trazabilidad (auditoría) y métricas de rendimiento
- Asegurar acceso por roles (Inspector → Supervisor → Admin)

---

## 3. Metodología

| Aspecto | Detalle |
|---------|---------|
| **Modelo** | Ciclo de vida iterativo-incremental |
| **Fases** | 1. Análisis de requerimientos (entrevistas con usuarios IGSS) |
| | 2. Diseño de base de datos y arquitectura |
| | 3. Desarrollo del backend (API REST) |
| | 4. Desarrollo del frontend (SPA) |
| | 5. Pruebas y despliegue |
| **Control de versiones** | Git + GitHub |

---

## 4. Requerimientos

### Funcionales

| Código | Requerimiento |
|--------|---------------|
| RF-01 | Login con contraseña local |
| RF-02 | Registro mediante código de invitación |
| RF-03 | 3 roles: Admin, Inspector, Supervisor |
| RF-04 | Flujo de informe: Pendiente → En Proceso → En Revisión → Finalizado / Devuelto / Anulado |
| RF-05 | Bandeja de supervisor para aprobar o devolver informes |
| RF-06 | Monitoreo de tiempos (días promedio por inspector y supervisor) |
| RF-07 | Administración de usuarios (CRUD) |
| RF-08 | Generación y gestión de códigos de invitación |

### No funcionales

| Código | Requerimiento |
|--------|---------------|
| RNF-01 | Autenticación JWT + cifrado bcrypt |
| RNF-02 | Autorización por roles (guards) |
| RNF-03 | Disponibilidad en la nube (Render + Vercel) |
| RNF-04 | Rate limiting contra abusos |
| RNF-05 | Auditoría de todas las transiciones de estado |
| RNF-06 | Content Security Policy contra XSS |

---

## 5. Arquitectura

```
[Cliente] ──HTTPS──> [Vercel (Frontend)]
                         │
                    API REST
                         │
                    [Render (Backend NestJS)]
                         │
                       SQL
                         │
                    [Neon (PostgreSQL)]
```

| Componente | Tecnología | Ubicación |
|------------|------------|-----------|
| Frontend | HTML5 + CSS3 + JavaScript (vanilla) | Vercel |
| Backend | NestJS + TypeScript | Render |
| Base de datos | PostgreSQL 16 | Neon Cloud |
| Autenticación | JWT (Passport.js) + bcryptjs | — |

### Patrón arquitectónico

- **Backend:** Arquitectura modular por dominio (cada módulo = funcionalidad de negocio)
- **Frontend:** SPA con vistas por pestañas, renderizado del lado del cliente
- **API:** REST full, JSON, stateless

---

## 6. Módulos del Backend

| Módulo | Responsabilidad | Endpoints clave |
|--------|----------------|-----------------|
| **Auth** | Login, registro con invitación, JWT | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` |
| **Informes** | CRUD + workflow, auditoría, secuencias | `POST /api/informes`, `PATCH /api/informes/:id/enviar-revision`, `PATCH /api/informes/:id/aprobar` |
| **Usuarios** | CRUD de usuarios, filtros por rol | `GET /api/usuarios`, `POST /api/usuarios`, `PATCH /api/usuarios/:id` |
| **Invitaciones** | Generación y validación de códigos UUID | `POST /api/invitaciones`, `GET /api/invitaciones` |
| **Admin** | Dashboard con KPIs, distribución, tendencias, alertas y monitoreo de tiempos | `GET /api/admin/dashboard/resumen`, `GET /api/admin/dashboard/distribucion`, `GET /api/admin/dashboard/tendencia`, `GET /api/admin/tiempos/inspectores` |
| **Health** | Endpoint de salud | `GET /api/health` |

### Destacado: Dashboard Administrativo

El Dashboard (rol Admin) centraliza indicadores clave del sistema con visualizaciones sin librerías externas:

| Componente | Descripción | Endpoint |
|------------|-------------|----------|
| **KPIs** | 7 tarjetas: total, pendientes, en curso, devueltos, finalizados, del mes, promedio días | `GET /api/admin/dashboard/resumen` |
| **Distribución** | Barras horizontales por estado con color semáforo | `GET /api/admin/dashboard/distribucion` |
| **Tendencia mensual** | Barras verticales apiladas (creados vs finalizados, últimos 12 meses) | `GET /api/admin/dashboard/tendencia` |
| **Rendimiento** | Barras horizontales por inspector con total de informes | `GET /api/admin/tiempos/inspectores` |
| **Alertas** | Tarjetas condicionales (devueltos > 0, pendientes > 10, promedio > 7 días) | Calculado del resumen |

Los gráficos usan **CSS puro** (divs con `width`/`height` porcentual y gradientes), sin canvas ni Chart.js.

### Destacado: Máquina de estados (`informe-estados.ts`)

Matriz de transiciones válidas que garantiza la integridad del workflow:

```
Pendiente    → En Proceso
En Proceso   → En Revisión
En Revisión  → Finalizado, Devuelto, Anulado
Devuelto     → En Proceso
Cualquier    → Anulado
```

---

## 7. Flujo de trabajo

```
Inspector                   Supervisor                  Admin
   │                           │                          │
   ├─ Solicita número          │                          │
   ├─ Llena datos              │                          │
   │   (nombrePatrono, NIT,    │                          │
   │    descripción, afiliación)│                        │
   ├─ Envía a revisión ───────>│                          │
   │                           ├─ Aprueba ───> Finalizado │
   │                           ├─ Devuelve ───> Pendiente │
   │<──────────────────────────┘                          │
   ├─ Reanuda desde devuelto   │                          │
   │                           │                          ├─ Monitorea tiempos
   │                           │                          ├─ Gestiona usuarios
   │                           │                          └─ Gestiona invitaciones
```

---

## 8. Base de Datos

### Entidades

| Entidad | Propósito | Columnas clave |
|---------|-----------|----------------|
| `usuarios` | Usuarios del sistema | `usuario_id`, `nombre`, `username`, `rol_id`, `password_hash`, `supervisor_id`, `activo` |
| `informes` | Informes patronales | `informe_id`, `numero_informe`, `estado`, `inspector_id`, `supervisor_id`, `nombre_patrono`, `nit_patrono`, `descripcion`, `iniciado_at`, `enviado_revision_at`, `finalizado_at` |
| `auditoria_informes` | Trazabilidad | `auditoria_id`, `informe_id`, `accion`, `usuario_id`, `detalle`, `created_at` |
| `informe_secuencia` | Contador atómico | `anio`, `ultimo_numero` |
| `informe_anulados` | Registro de anulaciones | `anulado_id`, `informe_id`, `motivo`, `anulado_por`, `created_at` |
| `invitaciones` | Códigos de registro | `invitacion_id`, `codigo`, `rol_id`, `usado`, `created_at` |

### Diseños destacados

- **Secuencia atómica:** `INSERT … ON CONFLICT (anio) DO UPDATE SET ultimo_numero = informe_secuencia.ultimo_numero + 1 RETURNING ultimo_numero` — sin race conditions entre requests concurrentes
- **Auditoría obligatoria:** Cada transición de estado registra `accion`, `usuario_id`, `detalle` y `created_at`
- **Índices:** En `estado`, `inspector_id`, `created_at` para consultas frecuentes

---

## 9. Seguridad

> Cada medida responde a una vulnerabilidad del **OWASP Top 10**.

| Capa | Medida | OWASP |
|------|--------|-------|
| **Transporte** | HTTPS forzado, HSTS | A3: Sensitive Data Exposure |
| **Autenticación** | JWT + bcrypt (10 rounds) | A2: Broken Authentication |
| **Autorización** | Guards por rol (Admin=1, Inspector=2, Supervisor=3) | A1: Broken Access Control |
| **Validación** | class-validator en todos los DTOs, whitelist + forbidNonWhitelisted | — |
| **Headers HTTP** | Helmet (XSS, content-type sniffing, clickjacking) | A6: Security Misconfiguration |
| **Rate Limiting** | 20 req/15min en `/api/auth`, 200 req/min global | A4: Injection (brute-force) |
| **CORS** | Solo frontend autorizado en producción | — |
| **CSP** | Content-Security-Policy en todas las páginas | A7: XSS |
| **XSS** | Escape `esc()` en todos los ~30 puntos de `innerHTML` | A7: XSS |
| **User enumeration** | Mensaje genérico "Credenciales inválidas" | A2: Broken Authentication |
| **DTOs seguros** | `ActualizarUsuarioDto` explícitamente no permite `passwordHash` | A1: Mass Assignment |
| **CSRF** | `SameSite=Strict` planificado para cookies httpOnly | A8: CSRF |

---

## 10. Despliegue

| Componente | Plataforma | URL |
|------------|------------|-----|
| Frontend | Vercel (auto-deploy desde GitHub) | `https://sgfip-igss.vercel.app` |
| Backend | Render (via Procfile) | `https://sgfip-igss.onrender.com` |
| Base de datos | Neon (PostgreSQL serverless) | — |

**Pipeline:**
```
Git push → GitHub → Vercel (frontend automático)
                 → Render (manual / auto-deploy opcional)
```

---

## 11. Lecciones Aprendidas

### Lo que salió bien
- Arquitectura modular facilitó desarrollo y mantenimiento
- TypeORM + PostgreSQL dieron flexibilidad para cambios en esquema
- Máquina de estados evitó bugs de lógica de negocio
- Seguridad por diseño desde el inicio (no fue un "afterthought")

### Qué mejoraría
- Agregar tests automatizados (hoy hay 0 unit tests)
- Migrar a React/Vue para mejor mantenibilidad del frontend
- Refresh tokens y account lockout por intentos fallidos
- CI/CD para pruebas automáticas en cada PR
- Docker para entorno de desarrollo reproducible

---

## 12. Preguntas Frecuentes (posibles en exposición)

**¿Por qué NestJS y no Express?**  
NestJS impone estructura modular, inyección de dependencias y validation pipes — reduce deuda técnica a largo plazo.

**¿Cómo evitas que un inspector vea informes de otro?**  
Todos los queries de "mis informes" filtran por `inspectorId` extraído del JWT. El backend nunca confía en el frontend.

**¿Qué pasa si el servidor se cae en medio de una operación?**  
PostgreSQL garantiza atomicidad transaccional. Si el servidor falla, la BD queda en estado consistente.

**¿Cómo se manejan los números de informe concurrentes?**  
Usamos `INSERT … ON CONFLICT DO UPDATE … RETURNING` — PostgreSQL serializa los accesos al contador atómico.

**¿Qué framework usaste en el frontend?**  
Ninguno. Es vanilla JavaScript. Se eligió así por simplicidad y para evitar dependencias innecesarias en un sistema de uso interno.

---

## 13. Demo — Pasos sugeridos

1. **Login** como admin (mostrar menú completo)
2. **Ver usuarios** — mostrar lista con roles
3. **Generar invitación** — mostrar código generado
4. **Cerrar sesión** y **registrarse** como inspector
5. **Solicitar número de informe** — mostrar modal con número
6. **Llenar datos y enviar a revisión**
7. **Login como supervisor → Bandeja → Aprobar**
8. **Login como admin → Dashboard** — mostrar KPIs, barras de distribución, alertas, rendimiento y tendencia mensual
9. **Admin → Monitoreo** — mostrar tiempos detallados

---

> **SGFIP demuestra cómo aplicar principios de ingeniería de software — arquitectura modular, seguridad por diseño, trazabilidad completa — para resolver un problema real en una institución pública.**
