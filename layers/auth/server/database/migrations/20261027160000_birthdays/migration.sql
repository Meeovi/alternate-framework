-- Birthdays (layers/social /connect/birthdays): a member's date of birth and
-- how they like to wish the people they follow a happy birthday ('post' on
-- the person's profile, or a private 'message'). Kept on "users" rather than
-- Directus "profiles" so the full date stays private: the app's /api/cms
-- proxy refuses every read of "users", and /api/social/birthdays only ever
-- hands out the day and month, and only to that member's followers.
-- To revert: ALTER TABLE "users" DROP COLUMN "birth_date", DROP COLUMN "birthday_greeting";
BEGIN;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birth_date" date;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birthday_greeting" text;
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_birthday_greeting_check";
ALTER TABLE "users" ADD CONSTRAINT "users_birthday_greeting_check" CHECK ("birthday_greeting" IS NULL OR "birthday_greeting" IN ('post', 'message'));
COMMIT;
