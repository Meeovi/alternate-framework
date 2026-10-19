-- Licensing (contract v1.0, layers/commerce/server/licensing): its own
-- `licensing` schema, used only by the app server (connects as `postgres`).
--
-- Uniqueness the contract requires is enforced here, not just in code:
--   one license per (purchase_id, product_license_id), unique license_key,
--   one ACTIVE installation per (user_license_id, target_type, target_id).
-- Terms versions are immutable (only `active` may change) and download
-- records are append-only (triggers below).
--
-- Not exposed: Directus only reads `public`, and the Supabase API roles
-- (anon, authenticated) get no privileges on this schema.
--
-- To revert: DROP SCHEMA licensing CASCADE;
BEGIN;

CREATE SCHEMA IF NOT EXISTS licensing;

CREATE TABLE licensing.license_types (
  id          text PRIMARY KEY,
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  scope       text NOT NULL CHECK (scope IN ('personal', 'commercial', 'workspace', 'organisation', 'exclusive', 'subscription')),
  permissions jsonb NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE licensing.license_type_versions (
  id              text PRIMARY KEY,
  license_type_id text NOT NULL REFERENCES licensing.license_types (id),
  version         text NOT NULL CHECK (version ~ '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'),
  title           text NOT NULL,
  terms           text NOT NULL,
  effective_date  timestamptz NOT NULL,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (license_type_id, version)
);

CREATE TABLE licensing.product_licenses (
  id                  text PRIMARY KEY,
  product_id          text NOT NULL,
  license_type_id     text NOT NULL REFERENCES licensing.license_types (id),
  license_version_id  text NOT NULL REFERENCES licensing.license_type_versions (id),
  title               text NOT NULL,
  price               numeric(12, 2) NOT NULL CHECK (price >= 0),
  active              boolean NOT NULL DEFAULT true,
  subscription_based  boolean NOT NULL DEFAULT false,
  max_downloads       integer CHECK (max_downloads >= 0),
  max_installations   integer CHECK (max_installations >= 0),
  expires_after_days  integer CHECK (expires_after_days > 0),
  metadata            jsonb,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_licenses_product_idx ON licensing.product_licenses (product_id);

CREATE TABLE licensing.user_licenses (
  id                  text PRIMARY KEY,
  license_key         text NOT NULL UNIQUE,
  user_id             text NOT NULL,
  product_id          text NOT NULL,
  product_license_id  text NOT NULL REFERENCES licensing.product_licenses (id),
  purchase_id         text NOT NULL,
  version_id          text NOT NULL REFERENCES licensing.license_type_versions (id),
  status              text NOT NULL CHECK (status IN ('active', 'expired', 'revoked', 'suspended')),
  activated_at        timestamptz,
  expires_at          timestamptz,
  metadata            jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (purchase_id, product_license_id)
);
CREATE INDEX user_licenses_user_product_idx ON licensing.user_licenses (user_id, product_id);

CREATE TABLE licensing.license_installations (
  id               text PRIMARY KEY,
  user_license_id  text NOT NULL REFERENCES licensing.user_licenses (id),
  target_type      text NOT NULL CHECK (target_type IN ('user', 'workspace', 'organisation')),
  target_id        text NOT NULL,
  installed_at     timestamptz NOT NULL DEFAULT now(),
  active           boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX license_installations_one_active_idx
  ON licensing.license_installations (user_license_id, target_type, target_id) WHERE active;
CREATE INDEX license_installations_license_idx ON licensing.license_installations (user_license_id);

CREATE TABLE licensing.license_downloads (
  id               text PRIMARY KEY,
  user_license_id  text NOT NULL REFERENCES licensing.user_licenses (id),
  file_id          text NOT NULL,
  downloaded_at    timestamptz NOT NULL DEFAULT now(),
  metadata         jsonb
);
CREATE INDEX license_downloads_license_idx ON licensing.license_downloads (user_license_id);

-- Idempotency-Key results (IdempotencyProvider). `state` = pending while
-- the first request runs; `result` holds its outcome for retries.
CREATE TABLE licensing.idempotency_keys (
  key          text PRIMARY KEY,
  fingerprint  text NOT NULL,
  state        text NOT NULL CHECK (state IN ('pending', 'done')),
  result       jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idempotency_keys_created_idx ON licensing.idempotency_keys (created_at);

-- Terms versions: everything but `active` is immutable; no deletes.
CREATE FUNCTION licensing.protect_license_type_version() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'license terms versions are immutable (delete refused)';
  END IF;
  IF (NEW.id, NEW.license_type_id, NEW.version, NEW.title, NEW.terms, NEW.effective_date, NEW.created_at)
     IS DISTINCT FROM (OLD.id, OLD.license_type_id, OLD.version, OLD.title, OLD.terms, OLD.effective_date, OLD.created_at) THEN
    RAISE EXCEPTION 'license terms versions are immutable (only active may change)';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER license_type_versions_immutable BEFORE UPDATE OR DELETE ON licensing.license_type_versions
  FOR EACH ROW EXECUTE FUNCTION licensing.protect_license_type_version();

-- Download records: append-only audit trail.
CREATE FUNCTION licensing.protect_license_download() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'license download records are append-only';
END $$;
CREATE TRIGGER license_downloads_append_only BEFORE UPDATE OR DELETE ON licensing.license_downloads
  FOR EACH ROW EXECUTE FUNCTION licensing.protect_license_download();

-- No access for Supabase's API roles (or anyone but the owner).
REVOKE ALL ON SCHEMA licensing FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA licensing FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA licensing FROM PUBLIC;
DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON SCHEMA licensing FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA licensing FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA licensing REVOKE ALL ON TABLES FROM %I', r);
    END IF;
  END LOOP;
END $$;

-- Standard license types, v1.0 terms. Plain-language terms: have them
-- reviewed before selling under them commercially.
INSERT INTO licensing.license_types (id, slug, name, description, scope, permissions) VALUES
  ('personal', 'personal', 'Personal License', 'For your own personal, non-commercial use.', 'personal',
   '{"personalUse": true, "commercialUse": false, "clientProjects": false, "modification": true, "redistribution": false, "resale": false, "attributionRequired": false}'),
  ('commercial', 'commercial', 'Commercial License', 'For use in your own commercial work and client projects.', 'commercial',
   '{"personalUse": true, "commercialUse": true, "clientProjects": true, "modification": true, "redistribution": false, "resale": false, "attributionRequired": false}'),
  ('workspace', 'workspace', 'Workspace License', 'For a whole Meeovi workspace and its members.', 'workspace',
   '{"personalUse": true, "commercialUse": true, "clientProjects": true, "modification": true, "redistribution": false, "resale": false, "attributionRequired": false}');

INSERT INTO licensing.license_type_versions (id, license_type_id, version, title, terms, effective_date) VALUES
  ('personal-1.0', 'personal', '1.0', 'Personal License 1.0',
   E'You may use this product for your own personal, non-commercial purposes, and modify it for that use.\n\nYou may not use it in commercial work or client projects, redistribute it, or resell it.\n\nThis license is personal to you and ends if the purchase is refunded.',
   '2026-10-19'),
  ('commercial-1.0', 'commercial', '1.0', 'Commercial License 1.0',
   E'You may use this product, and modify it, in your own personal and commercial work, including projects for your clients.\n\nYou may not redistribute or resell the product itself, alone or as part of a competing product.\n\nThis license ends if the purchase is refunded.',
   '2026-10-19'),
  ('workspace-1.0', 'workspace', '1.0', 'Workspace License 1.0',
   E'This product may be installed in one Meeovi workspace and used, and modified, by its members for personal and commercial work, including client projects.\n\nIt may not be redistributed or resold, or installed in other workspaces.\n\nThis license ends if the purchase is refunded.',
   '2026-10-19');

COMMIT;
