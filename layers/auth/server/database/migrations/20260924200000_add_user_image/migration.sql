-- better-auth core user field. Was missing from "users", so every
-- update-user / sign-up `image` was silently dropped. Holds a public
-- Pixanomy (app.pixanomy.com) link — see layers/shared/server/utils/pixanomy.ts.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" text;
