-- The `cart.user` foreign key was pointed at `directus_users` (Directus's
-- own built-in admin/CMS accounts — 7 rows) instead of `users` (the app's
-- real customer accounts used by every better-auth session). That made
-- every cart insert for a signed-in user fail its FK constraint outright.
-- No cart row has ever referenced a user yet (0 populated at the time of
-- writing), so this repoints the constraint with nothing to backfill or
-- lose — additive/corrective, not destructive.
ALTER TABLE "cart" DROP CONSTRAINT IF EXISTS "cart_user_foreign";
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_foreign" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE SET NULL;
