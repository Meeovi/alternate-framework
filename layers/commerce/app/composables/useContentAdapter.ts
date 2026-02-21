// Minimal content adapter surface for commerce layer.
// Adapters or the app can override by registering richer providers.

export function useContentAdapter(): any {
  const getBrandBar = async () => {
    return { name: '', menus: [] }
  }

  const getContentPage = async (slug?: string) => {
    return { title: '', body: '' }
  }

  return {
    getBrandBar,
    getContentPage
  }
}

export default useContentAdapter
