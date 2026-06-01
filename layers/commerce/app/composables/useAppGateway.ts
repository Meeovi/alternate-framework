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