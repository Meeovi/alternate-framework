declare module '#imports' {
  // Minimal shims for Nuxt auto-imports used in script-setup
  export const useHead: any
  export const useNuxtApp: any
  export const useAsyncData: any
  export const useState: any
  export const useFetch: any
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Broad runtime shims to help isolated tsc runs in this monorepo
declare module 'pinia' {
  export function defineStore(id: any, setup?: any): any
  export function createPinia(): any
  const pinia: any
  export default pinia
}

declare module 'lodash-es' {
  const _default: any
  export default _default
  export const groupBy: any
  export const uniqBy: any
}

declare module '~/*'
declare module '@/*'

declare const defineStore: any
declare function ref<T = any>(v?: T): any
declare function computed<T = any>(fn: any): any
declare function readonly<T = any>(v: T): T
declare const reactive: any
declare const watch: any
declare const onMounted: any
declare const onBeforeMount: any
declare const onUnmounted: any

// Nuxt auto-imports (already partially declared under #imports)
declare const useNuxtApp: any
declare const useHead: any
declare const useAsyncData: any
declare const useState: any
declare const useFetch: any

// Test globals (vitest/jest)
declare function describe(...args: any[]): any
declare function it(...args: any[]): any
declare function beforeEach(...args: any[]): any
declare function afterEach(...args: any[]): any
declare const expect: any
declare const vi: any

// Common composable globals used across the layer (fallbacks for isolated tsc)
declare const useAuth: any
declare const useLoading: any
declare const useInventory: any
declare const useCache: any
declare const useNotification: any
declare const useOrders: any
declare const useReturns: any
declare const useTransactions: any
declare const useInvoices: any
declare const useCreditMemos: any
declare const useProducts: any
declare const useFeaturedProducts: any
declare const useTax: any

// Common error / service placeholders
declare const errorHandler: any
declare const CartError: any
type MagentoService = any

// Domain types used in many composables
type Price = any
type ProductVariant = any
type Order = any
type Return = any
type Transaction = any
type Invoice = any
type CreditMemo = any
type OrderFilters = any
type ComparableAttribute = any
type ComparableProduct = any
type ComparableItem = any
type CompareList = any

// Store / state aliases
type CheckoutState = any
type ProductState = any
type ReviewState = any
type StorePickupState = any
type WishlistState = any

// Provide permissive module declarations for local app type modules
declare module '~/app/types' {
  export type Product = any
  export type Price = any
  export type HeroProps = any
  export type CategoryCardProps = any
  export type HeadingProps = any
  export type DisplayProps = any
  export type ProductSliderProps = any
  export type Cart = any
  export type Maybe<T = any> = T | null | undefined
}

// Export order-related types used by stores
declare module '~/app/types' {
  export type Order = any
  export type Return = any
  export type Transaction = any
  export type Invoice = any
  export type CreditMemo = any
  export type OrderFilters = any
}

// Component-level type shims
declare module '~/components/Heading/types' {
  export type HeadingProps = any
}
declare module '~/components/ProductSlider/types' {
  export type ProductSliderProps = any
}
declare module '~/components/ui/CategoryCard/types' {
  export type CategoryCardProps = any
}
declare module '~/components/ui/Display/types' {
  export type DisplayProps = any
}
declare module '~/components/ui/Hero/types' {
  export type HeroProps = any
}

// Local alias modules used by stores
declare module '@/types/product' {
  export type Product = any
  export type ProductState = any
}
declare module '@/types/review' {
  export type Review = any
  export type ReviewState = any
}

