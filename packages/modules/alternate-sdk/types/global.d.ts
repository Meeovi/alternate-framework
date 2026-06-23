// packages/alternate-sdk/types/global.d.ts
declare global {
  var useAuth: (() => { user: Ref<any> }) | undefined
}

export {}
