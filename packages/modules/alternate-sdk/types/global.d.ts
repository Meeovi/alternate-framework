// packages/alternate-sdk/types/global.d.ts
declare global {
  var useGateway: (() => Record<string, any>) | undefined
  var getAuth: ((event?: any) => Promise<any>) | undefined
  var useRuntimeConfig: (() => Record<string, any>) | undefined
  var useRequestHeaders: (() => Record<string, string>) | undefined
}

export {}
