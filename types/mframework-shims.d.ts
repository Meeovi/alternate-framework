// Global shims for monorepo - picked up via tsconfig.typeRoots

declare module '#shared/types' {
  export type UserLogin = any;
  export type DraftItem = any;
  export type DraftKey = string | number;
  export type DraftMap = Record<string, DraftItem>;
  export type GroupedNotifications = any;
  export type GroupedLikeNotifications = any;
  export type GroupedAccountLike = any;
  export type NotificationSlot = any;
  export type CommonRouteTabOption = any;
  export type PaginatorState = any;
  export type BuildInfo = any;
  export type ErrorDialogData = any;
  export type ElkTranslationStatus = any;
}

declare module '#shared/types/utils' {
  export type Overwrite<T, U> = Omit<T, keyof U> & U;
  export type Mutable<T> = {-readonly [P in keyof T]: T[P] } & T;
}

declare module '#shared/*' {
  const _default: any;
  export = _default;
}

// Common Vue / Nuxt auto-import shims
declare function ref<T = any>(value?: T): any;
declare function shallowRef<T = any>(value?: T): any;
declare function computed<T = any>(fn: any): any;
declare function watch(...args: any[]): any;
declare function watchEffect(...args: any[]): any;
declare function nextTick(...args: any[]): Promise<any>;

declare function useI18n(...args: any[]): any;
declare function useMasto(...args: any[]): any;
declare function useMastoClient(...args: any[]): any;
declare function useStreaming(...args: any[]): any;
declare function useSearch(...args: any[]): any;
declare function useUserSettings(...args: any[]): any;
declare function usePreferences(...args: any[]): any;
declare function useLocalStorage<T = any>(key: string, initial?: T, opts?: any): any;
declare function useHydratedHead(...args: any[]): any;
declare function useAppConfig(...args: any[]): any;
declare function useBuildInfo(...args: any[]): any;
declare function useColorMode(...args: any[]): any;
declare function useBreakpoints(...args: any[]): any;
declare function useDraft(...args: any[]): any;
declare function usePublish(...args: any[]): any;
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
