export function getEnv(key: string, fallback?: string): string | undefined {
  const value = process.env[key]
  return value ?? fallback
}
