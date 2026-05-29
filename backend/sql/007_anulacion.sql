-- ─────────────────────────────────────────────────
-- SGFIP — Migración 007: Anulación de informes
-- ─────────────────────────────────────────────────
-- Agrega columna motivo_anulacion a la tabla informes.
-- El supervisor puede anular informes desde cualquier
-- estado no finalizado.

ALTER TABLE informes ADD COLUMN motivo_anulacion varchar(1000);
