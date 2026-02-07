let _listProvider = null

export function registerListProvider(provider) {
  _listProvider = provider
}

export function getListProvider() {
  return _listProvider
}

export function listProviders() {
  return _listProvider ? [_listProvider] : []
}
