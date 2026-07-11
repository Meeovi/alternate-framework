import { getMeshInstance } from './runtime.js'

export { getMeshInstance as getMesh }

export async function executeMesh<T = unknown>(
  document: string | { toString(): string },
  variables?: Record<string, unknown>
): Promise<T> {
  const mesh = await getMeshInstance()
  const query = typeof document === 'string' ? document : document.toString()
  return mesh.execute(query, variables) as T
}