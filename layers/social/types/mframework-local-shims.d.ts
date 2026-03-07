// Local shims for layers/social to satisfy Nuxt typecheck

declare function useI18n(...args: any[]): any;
declare function useMasto(...args: any[]): any;
declare function useMastoClient(...args: any[]): any;
declare function useStreaming(...args: any[]): any;
declare function useSearch(...args: any[]): any;
declare function useUserSettings(...args: any[]): any;
declare function usePreferences(...args: any[]): any;
declare function useLocalStorage<T = any>(key: string, initial?: T, opts?: any): any;
declare function useRouter(...args: any[]): any;
declare function useRoute(...args: any[]): any;
declare function useHead(...args: any[]): any;

declare function getDisplayName(...args: any[]): string;
declare function getPreferences(...args: any[]): any;
declare function getReplyDraft(...args: any[]): any;
declare function fetchStatus(...args: any[]): any;
declare function fetchAccountInfo(...args: any[]): any;
declare function cacheAccount(...args: any[]): any;
declare function mastoLogin(...args: any[]): any;
declare function toShortHandle(s: string): string;
declare function useRelationship(...args: any[]): any;
declare function useFormattedDateTime(...args: any[]): any;

declare module '#imports' {
  export function useI18n(...args: any[]): any;
  export function useHead(...args: any[]): any;
  export function useRouter(...args: any[]): any;
  export function useRoute(...args: any[]): any;
}

export {};
