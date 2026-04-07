# layers/auth — local dev setup

Quick steps to run the `layers/auth` dev server locally with BetterAuth + Prisma.

1) Provide a Postgres database (example using Docker):

```bash
docker run --name mframework-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mframework_dev -p 5432:5432 -d postgres:15
```

2) Copy the example env and edit if needed:

```bash
cp .env.example .env.local
# Edit .env.local if your DB credentials differ or to set BASE_URL
```

3) (Optional) If your Prisma migrations are required, run them from the alternate-gateway core package — example:

```bash
cd ../../packages/modules/alternate-gateway/core
# If you have prisma/migrations set up, run migrate. If not, skip.
# npx prisma migrate deploy --schema=./prisma/schema.prisma --preview-feature
```

4) Start the auth layer dev server:

```bash
cd layers/auth
npm install
npm run dev
```

Nuxt will pick a free port if 3000 is taken (in my run it used 3006).

5) Test session creation (example curl):

```bash
curl -i -X POST "http://localhost:3006/api/auth/create-session" \
  -H "Content-Type: application/json" \
  -d '{"account":{"id":"test-session-123","acct":"test@local"}}'
```

If BetterAuth is configured and the DB is reachable, the endpoint will upsert the user and attempt to create a session cookie. If the DB isn't available you will see a 500 error from the upsert.

If you want me to attempt to run the server here (I will need a reachable Postgres instance or permission to start one), tell me and I can try to start a Docker Postgres and re-run the test.