import {
  PrismaPg,
  PrismaMySQL,
  PrismaSQLite,
  PrismaMongoDB
} from "./adapters";
import { PrismaAccelerate } from "./adapters/edge";

export function resolvePrismaConfig() {
  const provider = process.env.DATABASE_PROVIDER ?? "postgres";
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("[adapter-prisma] DATABASE_URL is missing");
  }

  switch (provider) {
    case "postgres":
      return { url, adapter: new PrismaPg({ url }) };

    case "mysql":
      return { url, adapter: new PrismaMySQL({ url }) };

    case "sqlite":
      return { url, adapter: new PrismaSQLite({ url }) };

    case "mongo":
    case "mongodb":
      return { url, adapter: new PrismaMongoDB({ url }) };

    case "edge-postgres":
      return { url, adapter: new PrismaAccelerate({ url }) };

    default:
      return { url };
  }
}
