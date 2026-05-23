-- ═══════════════════════════════════════════════
-- SGFIP — Migración completa para producción
-- ═══════════════════════════════════════════════
-- Ejecutar en la base de datos PostgreSQL de Neon
-- antes de iniciar la app por primera vez.
--
-- Uso:
--   1. Conectarse a Neon vía psql o consola SQL
--   2. Copiar y pegar todo el contenido
--   3. Ejecutar
-- ═══════════════════════════════════════════════

-- 1. Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  usuario_id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  rol_id INTEGER NOT NULL DEFAULT 2,
  password_hash VARCHAR(255),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  supervisor_id INTEGER REFERENCES usuarios(usuario_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de informes
CREATE TABLE IF NOT EXISTS informes (
  informe_id SERIAL PRIMARY KEY,
  numero_informe VARCHAR(50) NOT NULL UNIQUE,
  inspector_id INTEGER NOT NULL REFERENCES usuarios(usuario_id),
  supervisor_id INTEGER REFERENCES usuarios(usuario_id),
  tipo_inspeccion VARCHAR(80) NOT NULL DEFAULT 'Regular',
  nombre_patrono VARCHAR(255) NOT NULL,
  nit_patrono VARCHAR(20) NOT NULL,
  direccion_patrono VARCHAR(500),
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  observacion VARCHAR(1000),
  fecha_limite TIMESTAMP WITH TIME ZONE,
  fecha_informe DATE,
  descripcion TEXT,
  no_afiliacion_riesgo VARCHAR(100),
  no_oficio VARCHAR(100),
  fecha_oficio DATE,
  envio VARCHAR(500),
  iniciado_at TIMESTAMP WITH TIME ZONE,
  enviado_revision_at TIMESTAMP WITH TIME ZONE,
  finalizado_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Secuencia anual para correlativos INF-AAAA-NNNN
CREATE TABLE IF NOT EXISTS informe_secuencia (
  anio INTEGER PRIMARY KEY,
  ultimo_numero INTEGER NOT NULL
);

-- 4. Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_informes_estado ON informes(estado);
CREATE INDEX IF NOT EXISTS idx_informes_inspector ON informes(inspector_id);
CREATE INDEX IF NOT EXISTS idx_informes_numero ON informes(numero_informe);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol_id);
