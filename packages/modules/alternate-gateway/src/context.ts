import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSession } from "./envelop/auth/session";
import { verifyJwtFromRequest } from "./envelop/auth/jwt";

export type GatewayUser = {
  id: string;
  email?: string;
  roles: string[];
};

export type GatewaySession = {
  id: string;
  issuedAt: number;
};

export type GatewayAdapters = Record<string, Record<string, unknown>>;

type AdapterBindingFactory = () => GatewayAdapters;

const contextDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(contextDir, "..", "..", "..", "..");
const adapterPackagesDir = join(repoRoot, "packages", "adapters");

const mergeAdapterBindings = (target: GatewayAdapters, source: GatewayAdapters): void => {
  for (const [groupName, groupBindings] of Object.entries(source)) {
    target[groupName] = {
      ...(target[groupName] ?? {}),
      ...groupBindings
    };
  }
};

const discoverExternalBindingFactories = async (): Promise<AdapterBindingFactory[]> => {
  if (!existsSync(adapterPackagesDir)) {
    return [];
  }

  const factories: AdapterBindingFactory[] = [];
  const entries = readdirSync(adapterPackagesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("adapter-")) {
      continue;
    }

    const indexPath = join(adapterPackagesDir, entry.name, "index.ts");
    if (!existsSync(indexPath)) {
      continue;
    }

    try {
      const loadedModule = await import(pathToFileURL(indexPath).href);
      const maybeFactory = loadedModule.createGatewayAdapterBindings;

      if (typeof maybeFactory === "function") {
        factories.push(maybeFactory as AdapterBindingFactory);
      }
    } catch (error) {
      console.warn(
        `[gateway] Failed to load adapter context bindings from ${entry.name}:`,
        error
      );
    }
  }

  return factories;
};

let externalBindingFactoriesPromise: Promise<AdapterBindingFactory[]> | null = null;

const getExternalBindingFactories = async (): Promise<AdapterBindingFactory[]> => {
  if (!externalBindingFactoriesPromise) {
    externalBindingFactoriesPromise = discoverExternalBindingFactories();
  }

  return externalBindingFactoriesPromise;
};

export type GatewayContext = {
  requestId: string;
  user: GatewayUser | null;
  session: GatewaySession;
  adapters: GatewayAdapters;
};

export const createGatewayContext = async (request: Request): Promise<GatewayContext> => {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const user = await verifyJwtFromRequest(request);
  const factories = await getExternalBindingFactories();
  const adapters: GatewayAdapters = {
    commerce: {}
  };

  for (const factory of factories) {
    const bindings = factory();
    mergeAdapterBindings(adapters, bindings);
  }

  return {
    requestId,
    user,
    session: buildSession(request, requestId),
    adapters
  };
};