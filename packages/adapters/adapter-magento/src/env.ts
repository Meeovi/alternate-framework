export function loadEnv(runtimeConfig: { mybackend: { endpoint: any; token: any; }; }) {
  return {
    endpoint: runtimeConfig.mybackend?.endpoint || process.env.MAGENTO_GRAPHQL_URL,
    token: runtimeConfig.mybackend?.token || process.env.GQL_KEY
  }
}
