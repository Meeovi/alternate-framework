export type GatewaySdkRequester = <TResult, TVariables>(
  operationName: string,
  variables?: TVariables
) => Promise<TResult>;

export const createGatewaySdk = (requester: GatewaySdkRequester) => ({
  authGetUser: () => requester("authGetUser"),
  commerceGetProduct: (variables: { id: string }) => requester("commerceGetProduct", variables),
  searchQuery: (variables: { input: { query: string; page?: number; pageSize?: number } }) =>
    requester("searchQuery", variables),
  socialFeed: (variables: { input: { cursor?: string; limit?: number } }) => requester("socialFeed", variables),
  listsByOwner: (variables: { ownerId: string }) => requester("listsByOwner", variables),
  chatMessages: (variables: { roomId: string; limit?: number }) => requester("chatMessages", variables),
  sellerAnalytics: (variables: { storeId: string }) => requester("sellerAnalytics", variables)
});