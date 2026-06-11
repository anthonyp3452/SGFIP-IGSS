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
  tipo VARCHAR(20) NOT NULL DEFAULT 'informe',
  tipo_inspeccion VARCHAR(80) NOT NULL DEFAULT 'Regular',
  nombre_patrono VARCHAR(255),
  numero_patronal VARCHAR(100),
  direccion_patrono VARCHAR(500),
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  observacion VARCHAR(1000),
  fecha_limite TIMESTAMP WITH TIME ZONE,
  fecha_informe DATE,
  descripcion TEXT,
  no_afiliacion_riesgo VARCHAR(100),
  periodo_desde DATE,
  periodo_hasta DATE,
  monto_revisado NUMERIC(15,2),
  no_oficio VARCHAR(100),
  fecha_oficio DATE,
  envio VARCHAR(500),
  iniciado_at TIMESTAMP WITH TIME ZONE,
  enviado_revision_at TIMESTAMP WITH TIME ZONE,
  finalizado_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de órdenes de trabajo
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
  orden_id SERIAL PRIMARY KEY,
  codigo_orden VARCHAR(20) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  numero_patronal VARCHAR(100) NOT NULL,
  nombre_patrono VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  numero_afiliado VARCHAR(100),
  nombre_afiliado VARCHAR(255),
  dependencia_solicitante VARCHAR(255),
  fecha_ingreso DATE,
  documentos_soporte TEXT,
  inspector_id INTEGER NOT NULL REFERENCES usuarios(usuario_id),
  supervisor_id INTEGER NOT NULL REFERENCES usuarios(usuario_id),
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FK de informes a ordenes_trabajo
ALTER TABLE informes ADD COLUMN IF NOT EXISTS orden_trabajo_id INTEGER REFERENCES ordenes_trabajo(orden_id);
ALTER TABLE informes ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'informe';
ALTER TABLE informes ADD COLUMN IF NOT EXISTS numero_patronal VARCHAR(100);
ALTER TABLE informes ADD COLUMN IF NOT EXISTS periodo_desde DATE;
ALTER TABLE informes ADD COLUMN IF NOT EXISTS periodo_hasta DATE;
ALTER TABLE informes ADD COLUMN IF NOT EXISTS monto_revisado NUMERIC(15,2);

-- 4. Secuencia anual para correlativos de OT NNN/YYYY
CREATE TABLE IF NOT EXISTS orden_trabajo_secuencia (
  anio INTEGER PRIMARY KEY,
  ultimo_correlativo INTEGER NOT NULL
);

-- 5. Números de OT anulados
CREATE TABLE IF NOT EXISTS orden_trabajo_anuladas (
  anio INTEGER NOT NULL,
  numero INTEGER NOT NULL,
  PRIMARY KEY (anio, numero)
);

-- 6. Secuencia anual para correlativos de Acta NNN/YYYY
CREATE TABLE IF NOT EXISTS acta_secuencia (
  anio INTEGER PRIMARY KEY,
  ultimo_correlativo INTEGER NOT NULL
);

-- 7. Números de informe anulados por el administrador
CREATE TABLE IF NOT EXISTS informe_anulados (
  anio INTEGER NOT NULL,
  numero INTEGER NOT NULL,
  PRIMARY KEY (anio, numero)
);

-- 8. Secuencia anual para correlativos INF-AAAA-NNNN
CREATE TABLE IF NOT EXISTS informe_secuencia (
  anio INTEGER PRIMARY KEY,
  ultimo_numero INTEGER NOT NULL
);

-- 9. Auditoría de cambios (conservación mínima 1 año)
CREATE TABLE IF NOT EXISTS auditoria_informes (
  auditoria_id BIGSERIAL PRIMARY KEY,
  informe_id INTEGER NOT NULL,
  numero_informe VARCHAR(50) NOT NULL,
  usuario_id INTEGER,
  accion VARCHAR(50) NOT NULL,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50),
  detalle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_informe ON auditoria_informes(informe_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created ON auditoria_informes(created_at);

-- 10. Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_informes_estado ON informes(estado);
CREATE INDEX IF NOT EXISTS idx_informes_inspector ON informes(inspector_id);
CREATE INDEX IF NOT EXISTS idx_informes_numero ON informes(numero_informe);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_ot_inspector ON ordenes_trabajo(inspector_id);
CREATE INDEX IF NOT EXISTS idx_ot_estado ON ordenes_trabajo(estado);
CREATE INDEX IF NOT EXISTS idx_informes_ot ON informes(orden_trabajo_id);
