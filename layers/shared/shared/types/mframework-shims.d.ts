// Global shims for monorepo - picked up via tsconfig.typeRoots

declare module '#shared/types' {
  export * from './index';
}

declare module '#shared/types/utils' {
  export * from './utils';
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
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

export {};
