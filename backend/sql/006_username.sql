-- ─────────────────────────────────────────────────
-- SGFIP — Migración 006: Agregar columna username
-- ─────────────────────────────────────────────────
-- Reemplaza email como identificador de login.
-- El usuario escribe solo su nombre, el backend
-- agrega automáticamente '.igss'
-- Ejemplo: 'admin' → 'admin.igss', 'juan' → 'juan.igss'

ALTER TABLE usuarios ADD COLUMN username varchar(255);

-- Asignar username a usuarios existentes basado en su email
UPDATE usuarios SET username = LOWER(SPLIT_PART(email, '@', 1)) || '.igss' WHERE username IS NULL;

-- Hacer username NOT NULL y UNIQUE después de poblar
ALTER TABLE usuarios ALTER COLUMN username SET NOT NULL;
ALTER TABLE usuarios ADD CONSTRAINT uq_usuarios_username UNIQUE (username);

-- Email ya no es obligatorio para login
ALTER TABLE usuarios ALTER COLUMN email DROP NOT NULL;
