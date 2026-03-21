import useContentRequest from './useContentRequest'

export async function useContentSchema(
  collection: string,
  options?: {
    adapter?: { getSchema?: (collection: string) => Promise<any> }
  }
): Promise<any> {
  const adapter = options?.adapter ?? (typeof globalThis !== 'undefined' ? (globalThis as any).__CONTENT_ADAPTER : undefined)

  if (adapter && typeof adapter.getSchema === 'function') {
    return await adapter.getSchema(collection)
  }

  const { readFieldsByCollection } = useContentRequest()
  return await readFieldsByCollection(collection)
}

export default useContentSchema