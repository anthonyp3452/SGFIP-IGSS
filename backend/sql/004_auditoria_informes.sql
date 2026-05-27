-- ═══════════════════════════════════════════════
-- SGFIP — Migración 004: Auditoría de informes
-- ═══════════════════════════════════════════════
-- Crea la tabla de auditoría para registrar cada cambio de estado
-- con usuario, fecha y hora. Conservación recomendada: mínimo 1 año.

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
