import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { authAdapter } from "./auth/resolvers";
import { chatAdapter } from "./chat/resolvers";
import { commerceAdapter } from "./commerce/resolvers";
import { listsAdapter } from "./lists/resolvers";
import { searchAdapter } from "./search/resolvers";
import { sellerAdapter } from "./seller/resolvers";
import { socialAdapter } from "./social/resolvers";

export type AdapterModule = {
  name: string;
  typeDefs: string;
  resolvers: Record<string, unknown>;
};

const gatewayAdaptersDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(gatewayAdaptersDir, "..", "..", "..", "..", "..");
const adapterPackagesDir = join(repoRoot, "packages", "adapters");

const builtInAdapterModules: AdapterModule[] = [
  authAdapter,
  commerceAdapter,
  searchAdapter,
  socialAdapter,
  listsAdapter,
  chatAdapter,
  sellerAdapter
];

const isAdapterModule = (value: unknown): value is AdapterModule => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AdapterModule>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.typeDefs === "string" &&
    !!candidate.resolvers &&
    typeof candidate.resolvers === "object"
  );
};

const discoverExternalAdapterModules = async (): Promise<AdapterModule[]> => {
  if (!existsSync(adapterPackagesDir)) {
    return [];
  }

  const discovered: AdapterModule[] = [];
  const existingNames = new Set<string>(builtInAdapterModules.map((module) => module.name));
  const entries = readdirSync(adapterPackagesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("adapter-")) {
      continue;
    }

    const resolversPath = join(adapterPackagesDir, entry.name, "resolvers.ts");
    if (!existsSync(resolversPath)) {
      continue;
    }

    try {
      const resolverModule = await import(pathToFileURL(resolversPath).href);
      const loaded = Object.values(resolverModule).find(isAdapterModule);
      if (!loaded || existingNames.has(loaded.name)) {
        continue;
      }

      discovered.push(loaded);
      existingNames.add(loaded.name);
    } catch (error) {
      console.warn(
        `[gateway] Failed to load external adapter resolvers from ${entry.name}:`,
        error
      );
    }
  }

  return discovered;
};

const externalAdapterModules = await discoverExternalAdapterModules();

export const adapterModules: AdapterModule[] = [
  ...builtInAdapterModules,
  ...externalAdapterModules
];