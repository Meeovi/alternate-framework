import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { authMeshSource } from "./src/adapters/auth/mesh-source";
import { chatMeshSource } from "./src/adapters/chat/mesh-source";
import { commerceMeshSource } from "./src/adapters/commerce/mesh-source";
import { listsMeshSource } from "./src/adapters/lists/mesh-source";
import type { MeshAdapterSource } from "./src/adapters/mesh-types";
import { searchMeshSource } from "./src/adapters/search/mesh-source";
import { sellerMeshSource } from "./src/adapters/seller/mesh-source";
import { socialMeshSource } from "./src/adapters/social/mesh-source";
import { loadBaseAppEnv } from "./src/utils/load-base-app-env";

const loadedBaseAppDir = loadBaseAppEnv();
if (loadedBaseAppDir) {
  console.info(`[gateway] Loaded mesh env from base app: ${loadedBaseAppDir}`);
}

const defaultHeaders = {
  "x-gateway": "meeovi-gateway"
};

const gatewayDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(gatewayDir, "..", "..", "..");
const adapterPackagesDir = join(repoRoot, "packages", "adapters");

const extractRegexMatch = (source: string, expression: RegExp): string | null => {
  const match = source.match(expression);
  return match?.[1] ?? null;
};

const discoverExternalAdapterSources = (): MeshAdapterSource[] => {
  if (!existsSync(adapterPackagesDir)) {
    return [];
  }

  const sourceNames = new Set<string>([
    "auth",
    "commerce",
    "search",
    "social",
    "lists",
    "chat",
    "seller"
  ]);

  const discovered: MeshAdapterSource[] = [];
  const entries = readdirSync(adapterPackagesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("adapter-")) {
      continue;
    }

    const adapterDir = join(adapterPackagesDir, entry.name);
    const meshSourcePath = join(adapterDir, "mesh-source.ts");
    if (!existsSync(meshSourcePath)) {
      continue;
    }

    const meshSourceText = readFileSync(meshSourcePath, "utf-8");
    const adapterId = entry.name.replace(/^adapter-/, "");
    const explicitName = extractRegexMatch(meshSourceText, /name\s*:\s*["'`]([^"'`]+)["'`]/);
    const sourceName = explicitName ?? adapterId;

    if (sourceNames.has(sourceName)) {
      continue;
    }

    const endpointEnv = extractRegexMatch(
      meshSourceText,
      /process\.env\.([A-Z0-9_]*GRAPHQL(?:_URL)?)/
    );
    const tokenEnv = extractRegexMatch(meshSourceText, /process\.env\.([A-Z0-9_]*TOKEN)/);

    const endpoint =
      (endpointEnv ? process.env[endpointEnv] : undefined) ?? "http://localhost:4102/graphql";

    discovered.push({
      name: sourceName,
      handler: "graphql",
      endpoint,
      headers: tokenEnv
        ? {
            Authorization: `Bearer ${process.env[tokenEnv] ?? ""}`
          }
        : undefined
    });

    sourceNames.add(sourceName);
  }

  return discovered;
};

export const buildMeshSources = (): MeshAdapterSource[] => [
  authMeshSource(),
  commerceMeshSource(),
  searchMeshSource(),
  socialMeshSource(),
  listsMeshSource(),
  chatMeshSource(),
  sellerMeshSource(),
  ...discoverExternalAdapterSources()
].map((source) => ({
  ...source,
  headers: {
    ...defaultHeaders,
    ...(source.headers ?? {})
  }
}));

export default {
  sources: buildMeshSources()
};