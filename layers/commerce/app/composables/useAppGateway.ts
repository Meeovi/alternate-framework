function createFallbackContentApi() {
  const request = (async () => []) as any

  request.readItems = async () => []
  request.readItem = async () => null
  request.readFieldsByCollection = async () => []
  request.createItem = async () => null
  request.updateItem = async () => null
  request.deleteItem = async () => true
  request.uploadFiles = async () => null
  request.getAssetUrl = () => ''
  request.request = async () => null

  return request
}

export function useAppGateway() {
  const nuxtApp = useNuxtApp() as any
  
  // Priority 1: Check if $sdk is available (from plugin)
  if (nuxtApp.$sdk && nuxtApp.$sdk.content && typeof nuxtApp.$sdk.content.readItems === 'function') {
    return nuxtApp.$sdk
  }

  const sdk = (nuxtApp.$sdk || {}) as any

  if (!sdk.content || typeof sdk.content.readItems !== 'function') {
    sdk.content = createFallbackContentApi()
  }

  sdk.auth ||= {}
  sdk.commerce ||= {}
  sdk.search ||= {}
  sdk.media ||= {}

  if (!nuxtApp.$sdk) {
    nuxtApp.$sdk = sdk
  }

  return sdk
}

export default useAppGateway