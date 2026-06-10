-- Migración: agregar eliminación lógica y columnas geoespaciales

ALTER TABLE biohuerto
  ADD COLUMN IF NOT EXISTS area_geografica geometry(Polygon, 4326),
  ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS fecha_eliminacion TIMESTAMPTZ;

ALTER TABLE parcela
  ADD COLUMN IF NOT EXISTS ubicacion_geo geometry(Point, 4326),
  ADD COLUMN IF NOT EXISTS area_geografica geometry(Polygon, 4326),
  ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS fecha_eliminacion TIMESTAMPTZ;
