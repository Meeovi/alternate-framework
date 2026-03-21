import { ProductProvider } from "./types"

// Product providers
const providers: Record<string, ProductProvider> = {}

export function registerProductProvider(name: string, provider: ProductProvider) {
  providers[name] = provider
}

export function getProductProvider(name: string) {
  const provider = providers[name]
  if (!provider) throw new Error(`Product provider "${name}" not found`)
  return provider
}

export function registerProductProviderRuntime(name: string, provider: ProductProvider) {
  registerProductProvider(name, provider)
}

// Event providers (optional domain)
type EventProvider = {
  getEvent?(id: string): Promise<any>
  listEvents?(params?: Record<string, any>): Promise<any[]>
}

const eventProviders: Record<string, EventProvider> = {}

export function registerEventProvider(name: string, provider: EventProvider) {
  eventProviders[name] = provider
}

export function getEventProvider(name: string) {
  const provider = eventProviders[name]
  if (!provider) throw new Error(`Event provider "${name}" not found`)
  return provider
}

export function registerEventProviderRuntime(name: string, provider: EventProvider) {
  registerEventProvider(name, provider)
}

// Gift card providers (optional domain)
type GiftCardProvider = {
  getGiftCard?(id: string): Promise<any>
  listGiftCards?(params?: Record<string, any>): Promise<any[]>
  redeemGiftCard?(code: string): Promise<any>
}

const giftCardProviders: Record<string, GiftCardProvider> = {}

export function registerGiftCardProvider(name: string, provider: GiftCardProvider) {
  giftCardProviders[name] = provider
}

export function getGiftCardProvider(name: string) {
  const provider = giftCardProviders[name]
  if (!provider) throw new Error(`Gift card provider "${name}" not found`)
  return provider
}

export function registerGiftCardProviderRuntime(name: string, provider: GiftCardProvider) {
  registerGiftCardProvider(name, provider)
}

// Subscription providers (optional domain)
type SubscriptionProvider = {
  getSubscription?(id: string): Promise<any>
  listSubscriptions?(params?: Record<string, any>): Promise<any[]>
  subscribe?(payload: Record<string, any>): Promise<any>
}

const subscriptionProviders: Record<string, SubscriptionProvider> = {}

export function registerSubscriptionProvider(name: string, provider: SubscriptionProvider) {
  subscriptionProviders[name] = provider
}

export function getSubscriptionProvider(name: string) {
  const provider = subscriptionProviders[name]
  if (!provider) throw new Error(`Subscription provider "${name}" not found`)
  return provider
}

export function registerSubscriptionProviderRuntime(name: string, provider: SubscriptionProvider) {
  registerSubscriptionProvider(name, provider)
}
