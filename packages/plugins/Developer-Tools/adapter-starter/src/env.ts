export function loadEnv(runtimeConfig: Record<string, any>) {
  const publicConfig = runtimeConfig?.public?.adapterStarter || {}
  return {
    endpoint: publicConfig.endpoint || process.env.ADAPTER_STARTER_ENDPOINT,
    token: publicConfig.token || process.env.ADAPTER_STARTER_TOKEN
  }
}
