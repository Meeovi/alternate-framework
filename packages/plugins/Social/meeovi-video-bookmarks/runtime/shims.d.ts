// Ambient types for editors/tsc outside a Nuxt app (the app provides the real ones).
declare module '#imports' {
  export const useRuntimeConfig: (event?: any) => any
  export const useRoute: () => any
}
declare const $fetch: <T = any>(url: string, options?: any) => Promise<T>
declare module '#auth/server/utils/sessions' {
  export const requireSeller: (event: any) => Promise<{ id: string, username?: string | null, role?: string | null }>
}
declare module '#auth/server/utils/drizzle' { export const db: any }
declare module '#auth/server/database/migrations/schema' { export const users: any }
