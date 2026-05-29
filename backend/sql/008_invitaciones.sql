-- ─────────────────────────────────────────────────
-- SGFIP — Migración 008: Tabla de invitaciones
-- ─────────────────────────────────────────────────
-- Códigos de invitación generados por el admin
-- para que nuevos usuarios puedan registrarse.

CREATE TABLE invitaciones (
  id SERIAL PRIMARY KEY,
  codigo varchar(36) NOT NULL UNIQUE,
  rol_id integer NOT NULL,
  supervisor_id integer,
  usado boolean DEFAULT false,
  creado_por integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz
);
