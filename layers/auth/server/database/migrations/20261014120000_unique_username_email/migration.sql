-- Every username and email must be unique, ignoring case. "users" already
-- had a case-sensitive unique index on username (users_username_key) but
-- nothing on email, so the same address could register twice. better-auth
-- lowercases both before writing; these indexes enforce it at the database
-- level for any other writer (Directus, scripts, imports).
-- NULL usernames are still allowed (Postgres treats NULLs as distinct).
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_lower_key" ON "users" (lower("email"));
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_lower_key" ON "users" (lower("username"));
