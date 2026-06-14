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
  
  // Priority 1: Check if gateway is already initialized on nuxtApp (from plugin)
  if (nuxtApp.$gateway && nuxtApp.$gateway.content && typeof nuxtApp.$gateway.content.readItems === 'function') {
    return nuxtApp.$gateway
  }

  const gateway = (nuxtApp.$gateway || {}) as any

  if (!gateway.content || typeof gateway.content.readItems !== 'function') {
    gateway.content = createFallbackContentApi()
  }

  gateway.auth ||= {}
  gateway.commerce ||= {}
  gateway.search ||= {}

  if (!nuxtApp.$gateway) {
    nuxtApp.$gateway = gateway
  }

  return gateway
}

export default useAppGateway