function createFallbackContentApi() {
  const request = (async () => []) as any

  request.readItems = async () => []
  request.getItem = async () => null
  request.readItem = async () => null
  request.readFieldsByCollection = async () => []
  request.createItem = async () => null
  request.createItems = async () => null
  request.updateItem = async () => null
  request.updateItems = async () => null
  request.deleteItem = async () => true
  request.deleteItems = async () => true
  request.uploadFiles = async () => null
  request.getAssetUrl = () => ''
  request.request = async () => null
  request.readUsers = async () => []
  request.readUser = async () => null
  request.readRoles = async () => []
  request.readRole = async () => null
  request.readFolders = async () => []
  request.readFolder = async () => null
  request.readFiles = async () => []
  request.readFile = async () => null
  request.readFlows = async () => []
  request.readFlow = async () => null
  request.readShares = async () => []
  request.readShare = async () => null
  request.readPanels = async () => []
  request.readPanel = async () => null

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