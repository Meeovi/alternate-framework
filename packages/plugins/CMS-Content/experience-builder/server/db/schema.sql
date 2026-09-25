CREATE TABLE IF NOT EXISTS experience_pages (
  id UUID PRIMARY KEY,
  entity_type TEXT NOT NULL,   -- 'space', 'shop', 'user', etc.
  entity_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT,
  UNIQUE (entity_type, entity_id, slug)
);

CREATE TABLE IF NOT EXISTS experience_page_versions (
  id UUID PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES experience_pages(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  published BOOLEAN NOT NULL,
  version INTEGER NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);
