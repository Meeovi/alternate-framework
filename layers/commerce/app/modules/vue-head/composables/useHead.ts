export default function useHead(meta: { title?: string; description?: string; titleTemplate?: (titleChunk: any) => string } = {}) {
  if (typeof document !== 'undefined') {
    if (meta.title) {
      const resolvedTitle = typeof meta.title === 'function' ? (meta.title as any)() : meta.title
      document.title = resolvedTitle
    }
    if (meta.description) {
      let desc = document.querySelector('meta[name="description"]')
      if (!desc) {
        desc = document.createElement('meta')
        desc.setAttribute('name', 'description')
        document.head.appendChild(desc)
      }
      desc.setAttribute('content', meta.description)
    }
  }
  return {
    set(metaUpdate: { title?: string; description?: string; titleTemplate?: (titleChunk: any) => string }) {
      return useHead(metaUpdate)
    }
  }
}
