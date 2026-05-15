-- Tipo de inspección asociado a la solicitud de número (módulo solicitud).
ALTER TABLE informes
  ADD COLUMN IF NOT EXISTS tipo_inspeccion VARCHAR(80) NOT NULL DEFAULT 'Regular';

-- Quitar default tras poblar filas existentes (opcional; deja default si preferís).
-- ALTER TABLE informes ALTER COLUMN tipo_inspeccion DROP DEFAULT;
