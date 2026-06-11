-- ═══════════════════════════════════════════════
-- SGFIP — Migración 009: columnas faltantes
-- ═══════════════════════════════════════════════
-- Agrega columnas faltantes en informes:
--   tipo, numero_patronal, y migra datos desde nit_patrono
--
-- Uso: Copiar y pegar en el SQL Editor de Neon
-- ═══════════════════════════════════════════════

-- 1. Columna tipo (para discriminar informe/acta)
ALTER TABLE informes
  ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'informe';

-- 2. Columna numero_patronal (reemplaza nit_patrono)
ALTER TABLE informes
  ADD COLUMN IF NOT EXISTS numero_patronal VARCHAR(100);

-- 3. Migrar datos existentes de nit_patrono a numero_patronal
UPDATE informes
  SET numero_patronal = nit_patrono
  WHERE numero_patronal IS NULL
    AND nit_patrono IS NOT NULL;
