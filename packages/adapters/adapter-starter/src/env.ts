export function loadEnv(runtimeConfig: { mybackend: { endpoint: any; token: any; }; }) {
  return {
    endpoint: runtimeConfig.mybackend?.endpoint || process.env.MYBACKEND_ENDPOINT,
    token: runtimeConfig.mybackend?.token || process.env.MYBACKEND_TOKEN
  }
}
