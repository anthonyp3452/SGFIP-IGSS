-- Agrega campos para el flujo de trabajo: supervisor, observación, y nuevos estados.
-- Ejecutar en producción si no usas TypeORM synchronize.

ALTER TABLE informes
  ADD COLUMN IF NOT EXISTS supervisor_id INTEGER,
  ADD COLUMN IF NOT EXISTS observacion VARCHAR(1000);
