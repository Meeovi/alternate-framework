export function useContentFallback() {
  const contentFactory = (globalThis as any).useSdkContentAdapter as (() => any) | undefined
  if (typeof contentFactory !== 'function') {
    throw new Error('useSdkContentAdapter is not available')
  }
  const content = contentFactory()

  return {
    adapter: content,
    ...content,
  }
}

export default useContentFallback
