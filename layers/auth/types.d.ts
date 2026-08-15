// Type declarations for Nuxt auto-imports and internal path aliases
// that vue-tsc cannot resolve without the full Nuxt type generation.

declare module '#i18n' {
  export function useLocalePath(): (path: string) => string
  export function useI18n(): any
}

declare module '../composables/useAlert' {
  export function useAlert(): {
    error: (message: string) => void
    success: (message: string) => void
    info: (message: string) => void
    warning: (message: string) => void
  }
}

declare module '../composables/useAuth' {
  export function useAuth(): any
}

declare module '~/lib/auth-client' {
  export const authClient: any
}

declare module '../../lib/auth-client' {
  export const authClient: any
}

declare module '../../../lib/auth-client' {
  export const authClient: any
}

declare module '../../../../lib/auth-client' {
  export const authClient: any
}

declare module '../../../../../lib/auth-client' {
  export const authClient: any
}

declare module '#auth/lib/auth-client' {
  export const authClient: any
}
