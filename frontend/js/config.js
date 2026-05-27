// ───────────────────────────────────────────
// SGFIP — Configuración del frontend
// ───────────────────────────────────────────
// Ajuste estas URLs según el entorno:
//   - Desarrollo: backend en localhost:3000
//   - Producción: backend en Render

const SGFIP_CONFIG = {
  // URL base de la API (backend)
  apiBaseUrl: (() => {
    // Si hay una variable global inyectada por el servidor, úsala
    if (typeof __SGFIP_API_URL__ !== 'undefined') {
      return __SGFIP_API_URL__;
    }
    // Detección automática: si abrimos desde archivo local o localhost, usamos dev
    if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    return 'https://sgfip-back.onrender.com';
  })(),

  // Rutas de la API
  apiLoginPath: '/api/auth/login',
  apiRegisterPath: '/api/auth/register',
  apiInformesPath: '/api/informes',
  apiUsuariosPath: '/api/usuarios',
  apiAdminPath: '/api/admin',
};
