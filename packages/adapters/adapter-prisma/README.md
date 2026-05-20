@mframework/adapter-prisma
A backend‑agnostic, production‑ready wrapper around the Prisma Client.
This adapter provides:

A singleton Prisma client

Support for Postgres, MySQL, SQLite, MongoDB, and Edge adapters

Automatic environment‑based provider resolution

A clean API for initializing and retrieving the Prisma client

A structure for adding custom database adapters

Full compatibility with Prisma CLI in the host application

The adapter does not own your schema.
Your application keeps its own schema.prisma, migrations, and Prisma CLI commands.

✨ Features
Works with every Prisma provider

Supports Prisma Accelerate / Edge adapters

Zero TS leakage — ships compiled JS only

Safe singleton pattern for Node, serverless, and dev hot‑reload

Host app keeps full control of:

schema

migrations

Prisma CLI

datasource URLs

📦 Installation
In your host application:

bash
pnpm add @mframework/adapter-prisma
pnpm add @prisma/client
pnpm add -D prisma
Why?

@prisma/client + prisma are peer dependencies of the adapter

The host app must own the schema and CLI

🚀 Quick Start
1. Set environment variables
env
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
Supported providers:

Provider	Value aliases
PostgreSQL	postgresql, postgres
MySQL / MariaDB	mysql, mariadb
SQLite	sqlite
SQL Server	sqlserver, mssql
CockroachDB	cockroachdb, cockroach
MongoDB	mongodb, mongo


2. Initialize Prisma in your app
Create a file like:

src/db/prisma.ts

ts
import { createPrismaClient } from "@mframework/adapter-prisma";

export const prisma = createPrismaClient();
3. Use Prisma anywhere
ts
import { prisma } from "../db/prisma";

export async function getUser(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
Or use the lazy getter:

ts
import { getPrisma } from "@mframework/adapter-prisma";

const prisma = getPrisma();
⚙️ How Provider Resolution Works
The adapter reads:

env
DATABASE_PROVIDER=
DATABASE_URL=
Then loads the correct adapter package:

Provider	Adapter package
postgresql	@prisma/adapter-pg
mysql	@prisma/adapter-mysql
sqlite	@prisma/adapter-sqlite
sqlserver	@prisma/adapter-sqlserver
cockroachdb	@prisma/adapter-cockroachdb
mongodb	@prisma/adapter-mongodb

If a provider adapter package is missing, the adapter throws a clear install hint.

🧩 Creating New Database Adapters
All database adapters live in:

Code
adapter-prisma/
  src/
    adapters/
      postgres.ts
      mysql.ts
      sqlite.ts
      mongo.ts
      edge.ts
Each adapter is a thin wrapper around a Prisma driver adapter.

Example: Adding a new adapter
Suppose Prisma releases a new provider: cockroachdb.

Create:

src/adapters/cockroach.ts

ts
// import { PrismaCockroach } from "@prisma/adapter-cockroach";
export class PrismaCockroach {
  constructor(public config: any) {}
}
Then update src/env.ts:

ts
import { PrismaCockroach } from "./adapters/cockroach";

case "cockroach":
  return { url, adapter: new PrismaCockroach({ url }) };
That’s it — the adapter is now supported.

🛠 How to Add Edge Variants
Edge adapters (e.g., Prisma Accelerate) live in:

Code
src/adapters/edge.ts
Example:

ts
// import { PrismaAccelerate } from "@prisma/accelerate";
export class PrismaAccelerate {
  constructor(public config: any) {}
}
Then map it in env.ts:

ts
case "edge-postgres":
  return { url, adapter: new PrismaAccelerate({ url }) };
🧪 Using the Adapter in Serverless / Edge
The adapter uses a global singleton guard:

ts
const globalRef = globalThis as any;

if (!globalRef.__adapterPrisma) {
  globalRef.__adapterPrisma = buildClient(...);
}
This prevents:

multiple connections

hot‑reload storms

serverless cold‑start duplication

🧨 Error Handling
The adapter throws clear errors when:

DATABASE_URL is missing

getPrisma() is called before initialization

an unsupported provider is used

🧰 Running Prisma CLI (Migrations, Generate, Studio)
Because the host app installs prisma and @prisma/client, you can run:

bash
npx prisma migrate dev
npx prisma migrate deploy
npx prisma generate
npx prisma studio
The adapter does not proxy the CLI — the host app owns the schema.

🧱 Folder Structure (Recommended)
Code
apps/
  api/
    prisma/
      schema.prisma
      migrations/
    src/
      db/
        prisma.ts
packages/
  adapter-prisma/
    src/
      index.ts
      env.ts
      adapters/
        postgres.ts
        mysql.ts
        sqlite.ts
        mongo.ts
        edge.ts
    dist/
🧩 Extending the Adapter
You can extend the adapter with:

custom logging

metrics

tracing

connection pooling

multi‑tenant datasource switching

runtime schema loaders

Example:

ts
createPrismaClient({
  log: [{ level: "query", emit: "stdout" }]
});
🏁 Summary
@mframework/adapter-prisma gives you:

A clean, stable Prisma wrapper

Multi‑database support

Edge compatibility

A simple extension system

Full Prisma CLI support in the host app

It’s designed for production, ecosystem growth, and external developer contributions.## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Generated by M Framework — modular, backend-agnostic, and production-ready.*
