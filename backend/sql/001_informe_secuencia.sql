-- Contador anual para correlativos INF-AAAA-NNNN (concurrencia segura vía UPSERT en la app).
-- Ejecutar en producción si no usas TypeORM synchronize.

CREATE TABLE IF NOT EXISTS informe_secuencia (
  anio INTEGER PRIMARY KEY,
  ultimo_numero INTEGER NOT NULL
);

-- Si la tabla informes ya tenía números INF-AAAA-NNNN, ejecutar UNA VEZ para no repetir correlativos:
-- INSERT INTO informe_secuencia (anio, ultimo_numero)
-- SELECT
--   split_part(numero_informe, '-', 2)::integer,
--   max(split_part(numero_informe, '-', 3)::integer)
-- FROM informes
-- WHERE numero_informe LIKE 'INF-%-%'
-- GROUP BY split_part(numero_informe, '-', 2)::integer
-- ON CONFLICT (anio) DO UPDATE
-- SET ultimo_numero = GREATEST(informe_secuencia.ultimo_numero, excluded.ultimo_numero);
