import { getListsConfig } from './config'
import { getContentProvider } from './content/registry'

// Return the configured content provider for the lists layer.
export function useContentAdapter() {
  const { provider } = getListsConfig()
  const adapter = getContentProvider(provider)
  return adapter
}

export default useContentAdapter
