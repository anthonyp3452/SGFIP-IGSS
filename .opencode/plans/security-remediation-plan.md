# Plan de Remediación de Seguridad — SGFIP

**Prioridades:** 🔴 Crítico → 🟠 Alto → 🟡 Medio → 🔵 Bajo

---

## FASE 1 — 🔴 CRÍTICOS (ataques activos inmediatos)

### 1.1 Eliminar XSS por `innerHTML` en `app.html`

**Problema:** ~30 puntos de inyección donde datos de API se concatenan con template strings y se asignan via `innerHTML`.

**Solución:** Reemplazar TODO `innerHTML` dinámico por métodos DOM seguros.

**Archivo:** `frontend/app.html`

**Subtareas:**
- [ ] Crear una función helper `sanitize(text)` que use `textContent` + `createElement`
- [ ] Reemplazar `tbody.innerHTML = data.map(...)` en:
  - `cargarInformes()`
  - `cargarMisInformes()` (3 tabs: pendientes, proceso, devueltos)
  - `cargarBandejaSupervisor()`
  - `cargarUsuarios()`
  - `cargarInvitaciones()`
  - `cargarMonitoreo()` (3 tabs: inspectores, supervisores, general)
- [ ] Reemplazar `detalleContenido.innerHTML` en `verDetalle()`
- [ ] Reemplazar `badgeEstado()` y `badgeUrgencia()` para retornar objetos DOM en vez de strings HTML
- [ ] Reemplazar `renderDetalleFila()` para usar `createElement`

**Método recomendado:**
```js
function crearCelda(texto) {
  const td = document.createElement('td');
  td.textContent = texto;
  return td;
}

function crearBoton(texto, clases, onClick) {
  const btn = document.createElement('button');
  btn.className = clases;
  btn.textContent = texto;
  btn.onclick = onClick;
  return btn;
}
```

Luego construir filas con:
```js
const tr = document.createElement('tr');
tr.appendChild(crearCelda(inf.numeroInforme));
tr.appendChild(crearCelda(inf.nombrePatrono));
// ...
tbody.appendChild(tr);
```

---

### 1.2 Migrar token JWT a `httpOnly` cookie

**Problema:** Token almacenado en `localStorage`/`sessionStorage` — cualquier XSS lo roba.

**Solución:** Cambiar a cookie `httpOnly` + `Secure` + `SameSite=Strict`.

**Archivos:** `backend`, `frontend/app.html`, `frontend/index.html`

**Subtareas:**

**Backend (`auth.service.ts`):**
- [ ] En login exitoso, además de retornar el token en el body, **setear una cookie** `httpOnly` con el JWT
- [ ] Agregar endpoint `POST /api/auth/refresh` que use la cookie para emitir un nuevo token
- [ ] Agregar endpoint `POST /api/auth/logout` que limpie la cookie

**Backend (`main.ts`):**
- [ ] Configurar CORS para aceptar `credentials: true`

**Backend (nuevo middleware/guard):**
- [ ] Crear `CookieJwtAuthGuard` que lea el token de la cookie `sgfip_token` si no viene en `Authorization` header

**Frontend (`index.html`, `app.html`):**
- [ ] Eliminar `saveSession()` con `localStorage`/`sessionStorage`
- [ ] Eliminar `getAuthToken()` de localStorage
- [ ] Cambiar a: `fetch(url, { credentials: 'include' })` para que el browser envíe la cookie automáticamente
- [ ] En logout, llamar a `POST /api/auth/logout` en vez de solo limpiar storage local

**Alternativa más simple (si no se quiere cambiar el backend):**
- [ ] Envolver el token en una función que lo lea de una variable en memoria (no persistente)
- [ ] O usar `sessionStorage` por defecto y NUNCA `localStorage`

---

## FASE 2 — 🟠 ALTOS

### 2.1 Agregar Content Security Policy (CSP)

**Problema:** Sin CSP, cualquier script inyectado se ejecuta.

**Archivos:** `frontend/index.html`, `frontend/register.html`, `frontend/app.html`

**Subtareas:**
- [ ] Agregar `<meta http-equiv="Content-Security-Policy">` en cada HTML:
```
default-src 'self';
script-src 'self' 'unsafe-inline';  ← necesario para los scripts inline actuales
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' https://sgfip-igss.onrender.com http://localhost:3000;
frame-src 'none';
object-src 'none';
base-uri 'self';
```
- [ ] Opcional: migrar scripts inline a archivos `.js` externos para poder usar `'strict-dynamic'` en vez de `'unsafe-inline'`

---

### 2.2 Agregar protección CSRF

**Problema:** No hay tokens CSRF ni validación de origen.

**Archivos:** `backend`, `frontend`

**Subtareas:**

**Backend:**
- [ ] Generar un token CSRF en el login y devolverlo al frontend
- [ ] Validar el token CSRF en todas las mutaciones (POST, PATCH, DELETE)
- [ ] O más simple: verificar el header `Origin` o `Referer` contra `FRONTEND_URL`

**Frontend:**
- [ ] Incluir el token CSRF en un header `X-CSRF-Token` en cada request de mutación
- [ ] O usar `credentials: 'include'` + `SameSite=Strict` (si se migra a cookies)

---

### 2.3 Eliminar user enumeration en login

**Problema:** Mensajes diferentes para "usuario no encontrado" vs "contraseña incorrecta".

**Archivo:** `backend/src/modules/auth/auth.service.ts`

**Subtareas:**
- [ ] Unificar ambos errores en un mensaje genérico: `"Credenciales inválidas"`
- [ ] NO revelar si el usuario existe o no
- [ ] Hacer el mismo tiempo de respuesta en ambos casos (para evitar timing attacks)

---

### 2.4 Agregar DTOs para `POST` y `PATCH /api/usuarios`

**Problema:** Creación/edición de usuarios sin DTO — permite modificar `passwordHash`, `rolId`, etc.

**Archivos:** `backend/src/modules/usuarios/`

**Subtareas:**
- [ ] Crear `CrearUsuarioDto` con `class-validator`:
  - `nombre` @IsString @IsNotEmpty @MaxLength(100)
  - `username` @IsString @IsNotEmpty @Matches(/^[a-z0-9._-]+$/)
  - `password` @IsString @MinLength(8) @Matches(/^(?=.*\d)(?=.*[!@#$%^&*])/)
  - `rolId` @IsInt @IsIn([2, 3])
  - `supervisorId` @IsOptional @IsInt
- [ ] Crear `ActualizarUsuarioDto` con solo los campos permitidos:
  - `nombre` @IsOptional @IsString
  - `rolId` @IsOptional @IsInt @IsIn([1, 2, 3])
  - `activo` @IsOptional @IsBoolean
  - **NO** incluir `passwordHash`, `username`, `email`
- [ ] Aplicar los DTOs en `usuarios.controller.ts`

---

### 2.5 Sanitizar entrada de texto en backend

**Problema:** Campos como `descripcion`, `observacion`, `nombrePatrono` aceptan HTML/JS.

**Archivo:** `backend/src/modules/informes/`

**Subtareas:**
- [ ] Instalar `sanitize-html` o `dompurify` (lado servidor)
- [ ] Crear un `SanitizePipe` personalizado que limpie etiquetas HTML y escape caracteres
- [ ] Aplicar el pipe en los DTOs de informes
- [ ] O más simple: usar `@Matches(/^[a-zA-Z0-9áéíóúñü\s.,;:-]+$/)` donde sea posible

---

## FASE 3 — 🟡 MEDIOS

### 3.1 Agregar refresh token / revocación JWT

**Archivo:** `backend/src/modules/auth/`

- [ ] Crear tabla `refresh_tokens` en BD
- [ ] Emitir refresh token (con expiración más larga, ej: 7 días) además del access token
- [ ] Endpoint `POST /api/auth/refresh` que valide el refresh token y emita uno nuevo
- [ ] Endpoint `POST /api/auth/revoke` para invalidar tokens (útil cuando se desactiva un usuario)
- [ ] Marcar tokens como revocados cuando se cambia la contraseña

---

### 3.2 Account lockout por intentos fallidos

**Archivo:** `backend/src/modules/auth/auth.service.ts`

- [ ] Agregar columna `failed_login_attempts` e `locked_until` en tabla `usuarios`
- [ ] En login fallido: incrementar contador
- [ ] Si `failed_login_attempts >= 5`: bloquear por 15 minutos (`locked_until = now() + 15min`)
- [ ] En login exitoso: resetear contador a 0
- [ Mensaje de error si está bloqueado: "Cuenta bloqueada temporalmente por múltiples intentos fallidos"

---

### 3.3 Escalar `GET /api/informes` por rol

**Archivo:** `backend/src/modules/informes/informes.controller.ts`

- [ ] Admin: ve todos los informes (como ahora)
- [ ] Supervisor: ve informes de inspectores que le reportan
- [ ] Inspector: ve solo sus propios informes (redirigir a `mis-informes`)

---

### 3.4 Auditoría de autorización fallida

**Archivo:** `backend/src/modules/auth/roles.guard.ts`

- [ ] Agregar logging estructurado cuando se deniega acceso por roles
- [ ] Incluir: userId, ruta, método, IP, timestamp
- [ ] Usar `Logger` de NestJS o un servicio de auditoría

---

### 3.5 SSL certificate validation en BD

**Archivo:** `backend/src/config/database.config.ts`

- [ ] Cambiar `rejectUnauthorized: false` → `rejectUnauthorized: true`
- [ ] Asegurar que Neon proporcione certificados SSL válidos (lo hacen)

---

### 3.6 Contraseña: agregar "confirmar contraseña" en registro

**Archivo:** `frontend/register.html`

- [ ] Agregar campo "Confirmar contraseña" con `floating-label`
- [ ] Validar que coincida antes de enviar
- [ ] Mostrar error si no coinciden

---

### 3.7 Sesión por inactividad (idle timeout)

**Archivo:** `frontend/app.html`

- [ ] Agregar listener de `mousemove` / `keydown` / `scroll` que resetee un timer
- [ ] Si no hay actividad por 30 minutos → cerrar sesión automáticamente
- [ ] Mostrar toast de advertencia 1 minuto antes

---

### 3.8 Mostrar errores genéricos al usuario

**Archivo:** `frontend/register.html`, `frontend/app.html`

- [ ] En vez de `showToast(data.message, "error")`, mapear códigos de error del backend a mensajes genéricos predefinidos
- [ ] Nunca mostrar el mensaje crudo del backend

---

### 3.9 Rate limiting específico para registro

**Archivo:** `backend/src/main.ts`

- [ ] Agregar rate limiter específico para `POST /api/auth/register`: 5 req / 15 min por IP
- [ ] Mitiga brute-force de códigos de invitación

---

## FASE 4 — 🔵 BAJOS (mejoras)

### 4.1 Hash de contraseña en cliente antes de enviar

**Archivo:** `frontend/index.html`, `frontend/register.html`

- [ ] Hacer SHA-256 de la contraseña antes de enviarla (defense in depth)
- [ ] El backend debe aplicar bcrypt sobre el hash recibido

### 4.2 Agregar Subresource Integrity (SRI) a fuentes externas

**Archivo:** Todos los HTML

- [ ] Calcular hash de `https://fonts.googleapis.com/css2?family=Inter:...`
- [ ] Agregar atributo `integrity` + `crossorigin="anonymous"`

### 4.3 HSTS preload en backend

**Archivo:** `backend/src/main.ts`

- [ ] Configurar helmet con `strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true }`

### 4.4 Referrer-Policy

**Archivo:** `backend/src/main.ts`

- [ ] Configurar helmet con `referrerPolicy: { policy: 'same-origin' }`

---

## Resumen de esfuerzo

| Fase | Items | Archivos | Esfuerzo estimado |
|------|-------|----------|-------------------|
| 🔴 F1 | 2 críticos | 4-5 archivos | ~~medio~~ (muchos puntos de inyección) |
| 🟠 F2 | 5 altos | 8-10 archivos | ~~alto~~ (implica backend + frontend) |
| 🟡 F3 | 8 medios | 6-8 archivos | ~~medio~~ |
| 🔵 F4 | 3 bajos | 4-5 archivos | ~~bajo~~ |

**Total estimado: 15-20 horas de implementación.**

---

## Orden de implementación recomendado

```
Semana 1: 🔴 F1.1 (XSS) + F2.1 (CSP) + F2.3 (user enumeration)
Semana 2: 🟠 F2.4 (DTOs usuarios) + F2.5 (sanitize) + F3.6 (confirm password)
Semana 3: 🔴 F1.2 (cookies httpOnly) + F3.1 (refresh token) + F2.2 (CSRF)
Semana 4: 🟡 Resto de F3 + 🔵 F4
```

¿Quieres que empiece por la Fase 1 (XSS) o prefieres otro orden?
