-- Stripe was removed on 20 October 2026 (PayPal replaced it; Polar handles
-- memberships). Its leftover columns go. Before running this, the code that
-- lists these columns (schema.ts) must be gone from every running build —
-- better-auth's adapter selects every column the schema declares, so a
-- build that still lists users.stripe_customer_id would fail every sign-in.
--
-- The values held when this ran (1 user, 1 organization, 2 payments) and the
-- Directus field records are backed up in
-- /root/backups/stripe-columns-20261029.json.
-- To revert: re-add the columns (varchar(255) / text) and restore the values
-- from that backup.
BEGIN;
ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_customer_id";
ALTER TABLE "organizations" DROP COLUMN IF EXISTS "stripe_customer_id";
ALTER TABLE "os_payments" DROP COLUMN IF EXISTS "stripe_payment_id";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "stripe_payment_id";
ALTER TABLE "auth_subscriptions" DROP COLUMN IF EXISTS "stripe_customer_id";
ALTER TABLE "auth_subscriptions" DROP COLUMN IF EXISTS "stripe_subscription_id";
ALTER TABLE "auth_subscription_plans" DROP COLUMN IF EXISTS "stripe_price_id";
-- The Directus instance on this database kept field records for three of them.
DELETE FROM "directus_fields" WHERE "field" IN ('stripe_customer_id', 'stripe_payment_id')
  AND "collection" IN ('organizations', 'os_payments', 'orders');
COMMIT;
