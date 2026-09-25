import {
  createPrismaClient,
  getAdapterPackageForProvider,
  getSupportedDatabaseProviders,
  normalizeDatabaseProvider,
} from "../dist/index.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function resetPrismaEnv() {
  delete process.env.NUXT_DATABASE_URL;
  delete process.env.DATABASE_URL;
  delete process.env.DATABASE_PROVIDER;
}

function testHelpers() {
  const providers = getSupportedDatabaseProviders();

  assert(Array.isArray(providers), "supported providers must be an array");
  assert(providers.includes("postgresql"), "postgresql must be supported");
  assert(providers.includes("mysql"), "mysql must be supported");
  assert(providers.includes("sqlite"), "sqlite must be supported");
  assert(providers.includes("sqlserver"), "sqlserver must be supported");
  assert(providers.includes("cockroachdb"), "cockroachdb must be supported");
  assert(providers.includes("mongodb"), "mongodb must be supported");

  assert(normalizeDatabaseProvider("postgres") === "postgresql", "postgres alias normalization failed");
  assert(normalizeDatabaseProvider("mariadb") === "mysql", "mariadb alias normalization failed");
  assert(normalizeDatabaseProvider("mssql") === "sqlserver", "mssql alias normalization failed");
  assert(normalizeDatabaseProvider("mongo") === "mongodb", "mongo alias normalization failed");

  assert(
    getAdapterPackageForProvider("postgres") === "@prisma/adapter-pg",
    "postgres package mapping failed"
  );
  assert(
    getAdapterPackageForProvider("cockroach") === "@prisma/adapter-cockroachdb",
    "cockroach package mapping failed"
  );
  assert(getAdapterPackageForProvider("unknown-db") === null, "unknown provider should map to null");
}

function testUnsupportedProviderError() {
  resetPrismaEnv();
  process.env.NUXT_DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
  process.env.DATABASE_PROVIDER = "unknown-db";

  let errorMessage = "";
  try {
    createPrismaClient();
  } catch (error) {
    errorMessage = String(error?.message || error);
  }

  assert(errorMessage.includes("Unsupported DATABASE_PROVIDER"), "expected unsupported provider error");
  assert(errorMessage.includes("postgresql"), "expected supported provider list in error");
}

function testMissingAdapterPackageError() {
  resetPrismaEnv();
  process.env.NUXT_DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
  process.env.DATABASE_PROVIDER = "sqlserver";

  let errorMessage = "";
  try {
    createPrismaClient();
  } catch (error) {
    errorMessage = String(error?.message || error);
  }

  assert(errorMessage.includes("Missing adapter package"), "expected missing adapter package error");
  assert(errorMessage.includes("@prisma/adapter-sqlserver"), "expected sqlserver package hint in error");
}

try {
  testHelpers();
  testUnsupportedProviderError();
  testMissingAdapterPackageError();
  resetPrismaEnv();
  console.log("adapter-prisma smoke tests passed");
} catch (error) {
  resetPrismaEnv();
  console.error("adapter-prisma smoke tests failed");
  console.error(error);
  process.exit(1);
}
