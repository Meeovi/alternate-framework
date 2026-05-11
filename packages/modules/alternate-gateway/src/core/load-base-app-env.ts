import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, "..", "..", "..", "..");

const parseEnvFile = (content: string): Record<string, string> => {
  const parsed: Record<string, string> = {};
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const withoutExport = line.startsWith("export ") ? line.slice(7).trim() : line;
    const separatorIndex = withoutExport.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = withoutExport.slice(0, separatorIndex).trim();
    let value = withoutExport.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
};

const loadEnvFromPath = (envFilePath: string): boolean => {
  if (!existsSync(envFilePath)) {
    return false;
  }

  const content = readFileSync(envFilePath, "utf-8");
  const parsed = parseEnvFile(content);

  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return true;
};

export const loadBaseAppEnv = (): string | null => {
  const explicitBaseAppDir =
    process.env.BASE_APP_DIR ?? process.env.BASE_APP_PATH ?? process.env.NUXT_BASE_APP_DIR;

  const candidateAppDirs = [
    explicitBaseAppDir,
    join(repoRoot, "themes", "framework", "starter-template"),
    join(repoRoot, "apps", "ecosystem", "meeovi-app")
  ].filter((path): path is string => !!path);

  for (const appDir of candidateAppDirs) {
    const normalizedDir = resolve(appDir);
    const envCandidates = [join(normalizedDir, ".env.local"), join(normalizedDir, ".env")];

    let loadedFromAny = false;
    for (const envFilePath of envCandidates) {
      loadedFromAny = loadEnvFromPath(envFilePath) || loadedFromAny;
    }

    if (loadedFromAny) {
      return normalizedDir;
    }
  }

  return null;
};