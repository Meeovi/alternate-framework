-- schema.ts has declared users.stripe_customer_id / users.polar_customer_id
-- for a while, but no migration ever added them to the live `users` table,
-- so the @better-auth/stripe and @polar-sh/better-auth plugins had nowhere
-- to write the customer id they create on sign-up. Effect on the live app:
-- customer creation on sign-up silently no-ops, the billing portal link
-- can't be built, and deleteUser.beforeDelete (which lists Stripe
-- subscriptions by customer id before allowing account deletion) always
-- sees a null id and skips the check.
--
-- Additive and nullable — existing rows get NULL, backfilled the next time
-- each user hits a billing flow. Both plugins only ever set these fields
-- server-side (input:false in auth.ts), so no data migration is needed.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "polar_customer_id" varchar(255);
