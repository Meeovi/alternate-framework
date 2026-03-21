export function env(name: string, fallback?: string): string {
  const value = process.env[name] || fallback
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}
