export type EnvPrismaConfig = {
  url: string;
  driverAdapter?: unknown;
};

export function resolvePrismaFromEnv(): EnvPrismaConfig {
  const provider = process.env.DATABASE_PROVIDER ?? "postgres";
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "[adapter-prisma] DATABASE_URL is not set. " +
        "Set it in your environment or pass datasourceUrl explicitly."
    );
  }

  // You can branch here if you want to support edge adapters:
  // e.g. if (provider === "postgres-edge") { const adapter = new PrismaPg({ connectionString: url }); ... }

  return { url };
}
