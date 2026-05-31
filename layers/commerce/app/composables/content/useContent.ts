export function useContentFallback() {
  const { $gateway } = useNuxtApp()
  const content = ($gateway as any)?.content

  if (!content) {
    throw new Error('Gateway content adapter is not available')
  }

  return {
    adapter: content,
    ...content,
  }
}

export default useContentFallback
