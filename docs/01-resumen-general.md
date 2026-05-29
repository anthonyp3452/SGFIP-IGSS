# Resumen General del Sistema

## SGFIP — Sistema de Gestión de Flujo de Informes Patronales

**Institución:** Instituto Guatemalteco de Seguridad Social (IGSS) — Delegación Retalhuleu, Área de Inspección Patronal

---

## 1. Introducción

SGFIP es una aplicación web diseñada para digitalizar y automatizar el flujo de trabajo de los informes de inspección patronal en la Delegación de Retalhuleu del IGSS. El sistema reemplaza procesos manuales basados en papel y permite a inspectores y supervisores gestionar el ciclo de vida completo de un informe patronal: desde la solicitud de un número de informe, pasando por la captura de datos, la revisión por parte del supervisor, y la aprobación o devolución final, incluyendo la posibilidad de anulación con trazabilidad completa.

El sistema fue desarrollado como solución integral para optimizar los tiempos de respuesta, mantener una auditoría transparente de todas las acciones realizadas sobre cada informe, y centralizar la información en una base de datos segura y accesible desde cualquier lugar.

---

## 2. Objetivos

### Objetivo General
Automatizar el flujo de elaboración, revisión y aprobación de informes patronales del IGSS Delegación Retalhuleu.

### Objetivos Específicos
- Digitalizar el proceso de generación de números de informe y captura de datos patronales
- Implementar un sistema de revisión por parte de supervisores con capacidad de aprobar, devolver o anular informes
- Mantener un registro de auditoría completo de todas las acciones realizadas
- Proveer monitoreo de tiempos de respuesta por inspector y supervisor
- Garantizar la seguridad mediante autenticación JWT, contraseñas seguras y control de acceso por roles
- Facilitar el registro de nuevos usuarios mediante códigos de invitación generados por el administrador

---

## 3. Roles de Usuario

| ID | Rol | Descripción |
|----|-----|-------------|
| 1 | Administrador | Acceso total: gestión de usuarios, generación de códigos de invitación, monitoreo de tiempos, administración de secuencias de informes, visualización de auditoría |
| 2 | Inspector | Creación de informes, captura de datos patronales, envío a revisión, modificación de informes devueltos |
| 3 | Supervisor | Revisión de informes, aprobación, devolución con observaciones, anulación de informes |

---

## 4. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO (Navegador)                       │
│                                                               │
│   index.html (Login)    register.html (Registro)              │
│   app.html (Aplicación SPA con todas las vistas)              │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND — NestJS 11 (Render)                     │
│                                                               │
│   /api/auth        → Autenticación y registro                 │
│   /api/usuarios    → CRUD de usuarios                         │
│   /api/informes    → Ciclo de vida de informes                │
│   /api/invitaciones → Códigos de invitación                   │
│   /api/admin       → Monitoreo y administración               │
│   /api/health      → Health check                             │
└─────────────────────┬───────────────────────────────────────┘
                      │ SSL/TLS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DATOS — PostgreSQL (Neon)                │
│                                                               │
│   usuarios          → Usuarios del sistema                    │
│   informes          → Informes patronales                     │
│   auditoria_informes → Registro de auditoría                  │
│   invitaciones      → Códigos de invitación                   │
│   informe_secuencia → Contadores de números de informe        │
│   informe_anulados  → Números de informe saltados             │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Componente | Tecnología |
|------------|-----------|
| Frontend | HTML5, CSS3, JavaScript vanilla (sin frameworks) |
| Backend | NestJS 11 con TypeScript |
| Base de datos | PostgreSQL 16 (Neon Serverless) |
| Autenticación | JWT (JSON Web Tokens) + bcryptjs |
| Despliegue Frontend | Vercel (estático) |
| Despliegue Backend | Render (Web Service) |
| Seguridad | Helmet, express-rate-limit, CORS, class-validator |

---

## 5. Flujo Principal de Trabajo

### Diagrama de Estados del Informe

```
                    ┌──────────┐
                    │Pendiente │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
              ┌─────│En Proceso│─────┐
              │     └────┬─────┘     │
              │          │           │
         ┌────▼───┐ ┌───▼──────┐    │
         │Devuelto│ │En Revisión│    │
         └────┬───┘ └───┬──────┘    │
              │          │           │
              │     ┌────▼─────┐     │
              └─────│Finalizado│     │
                    └──────────┘     │
                    ┌──────────┐     │
                    │ Anulado  │◄────┘
                    └──────────┘
```

### Descripción del Flujo

1. **Solicitud**: El inspector genera un nuevo número de informe (estado: Pendiente)
2. **Trabajo**: El inspector inicia el informe y captura los datos del patrono (estado: En Proceso)
3. **Revisión**: El inspector envía el informe al supervisor (estado: En Revisión)
4. **Aprobación**: El supervisor puede:
   - **Aprobar**: Finalizar el informe (estado: Finalizado)
   - **Devolver**: Regresar al inspector con observaciones (estado: Devuelto)
   - **Anular**: Cancelar el informe con motivo (estado: Anulado)
5. **Corrección**: Si fue devuelto, el inspector corrige y reenvía (vuelve a En Proceso)
6. **Anulación**: El supervisor puede anular desde cualquier estado no final

---

## 6. Seguridad

### Autenticación
- Inicio de sesión mediante usuario y contraseña
- Los nombres de usuario se almacenan con el sufijo `.igss` (ej. `admin` → `admin.igss`)
- Las contraseñas se almacenan hasheadas con bcryptjs (10 rondas de sal)
- Requisitos de contraseña: mínimo 8 caracteres, al menos 1 número y 1 carácter especial

### Autorización
- JWT con expiración de 24 horas
- Control de acceso basado en roles (RBAC) mediante guardias de NestJS
- Cada endpoint verifica que el usuario tenga el rol adecuado

### Registro
- Solo administradores pueden generar códigos de invitación
- El registro público requiere un código de invitación válido
- Los códigos de invitación son UUIDs de un solo uso

### Protecciones
- Helmet para cabeceras HTTP de seguridad
- Rate limiting para prevenir ataques de fuerza bruta
- CORS restringido a la URL del frontend en producción
- Validación de datos de entrada con class-validator

---

## 7. Enlaces del Sistema

| Componente | URL |
|------------|-----|
| Aplicación web | https://sgfip-igss.vercel.app |
| API Backend | https://sgfip-igss.onrender.com |
| Health Check API | https://sgfip-igss.onrender.com/api/health |
| Repositorio | https://github.com/anthonyp3452/SGFIP-IGSS |

---

## 8. Base de Datos — Modelo Entidad-Relación

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios del sistema (nombre, username, rol, supervisor_id, activo) |
| `informes` | Informes patronales (número, inspector, supervisor, estado, datos patrono, fechas) |
| `auditoria_informes` | Trazabilidad de cambios de estado (usuario, acción, estados, detalle) |
| `invitaciones` | Códigos de invitación para registro (código UUID, rol, usado, creado por) |
| `informe_secuencia` | Contador anual de números de informe (año, último número) |
| `informe_anulados` | Números de informe saltados o anulados administrativamente |

---

## 9. Funcionalidades Clave

- **Gestión completa del ciclo de vida del informe** con transiciones de estado validadas
- **Numeración automática** con secuencia anual y detección de números saltados
- **Trazabilidad total** mediante registro de auditoría con usuario, acción y detalle
- **Monitoreo de tiempos** por inspector, supervisor y general
- **Códigos de invitación** para registro controlado de usuarios
- **Compartir código** mediante Web Share API nativa del dispositivo
- **Anulación de informes** con motivo obligatorio desde cualquier estado no final
- **Interfaz responsiva** adaptable a dispositivos móviles y de escritorio
