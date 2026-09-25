// packages/alternate-sdk/types/sdk.d.ts

export interface AlternateSDK {
  auth: ReturnType<typeof import('../src/auth').getServerAuth>

  commerce: ReturnType<
    typeof import('../src/commerce').getCommerceServer
  > | ReturnType<
    typeof import('../src/commerce').getServerCommerceAdapter
  >

  search: ReturnType<
    typeof import('../src/search').getSearchServer
  > | ReturnType<
    typeof import('../src/search').getServerSearchAdapter
  >

  content: ReturnType<
    typeof import('../src/content').getContentServer
  > | ReturnType<
    typeof import('../src/content').getServerContentAdapter
  >

  federation: ReturnType<
    typeof import('../src/federation').getFederationServer
  > | ReturnType<
    typeof import('../src/federation').getServerFederationAdapter
  >

  media: ReturnType<
    typeof import('../src/content').getServerContentAdapter
  >

  gateway: typeof import('../src/gateway')
  contracts: typeof import('../src/contracts')
  notifications: typeof import('../src/notifications')
  localization: typeof import('../src/localization')

  notify: typeof import('../src/notifications')
}
