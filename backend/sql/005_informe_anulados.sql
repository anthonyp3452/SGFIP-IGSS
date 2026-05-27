-- ═══════════════════════════════════════════════
-- SGFIP — Migración 005: Números de informe anulados
-- ═══════════════════════════════════════════════
-- Permite al administrador marcar números de informe como inutilizados.
-- El sistema salta estos números al generar correlativos nuevos.

CREATE TABLE IF NOT EXISTS informe_anulados (
  anio INTEGER NOT NULL,
  numero INTEGER NOT NULL,
  PRIMARY KEY (anio, numero)
);
