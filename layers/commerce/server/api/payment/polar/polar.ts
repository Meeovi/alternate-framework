import { ensurePolarCustomer, setupPolar } from '../../../utils/polar'
import { useRuntimeConfig } from '#imports'
import type { User } from 'alternate-sdk/contracts'
import { createError } from 'h3'

const runtimeConfig = useRuntimeConfig() as any

export const polarAccessToken = runtimeConfig.polarAccessToken as string
export const polarServer = (runtimeConfig.polarServer as 'sandbox' | 'production') || 'sandbox'
export const polarProductIdProMonth = runtimeConfig.polarProductIdProMonth as string
export const polarProductIdProYear = runtimeConfig.polarProductIdProYear as string
export const polarWebhookSecret = runtimeConfig.polarWebhookSecret as string

async function handlePolarEndpoint<T>(endpoint: () => T, context: string): Promise<T> {
  try {
    return await Promise.resolve(endpoint())
  } catch (error) {
    console.error(`[polar:${context}] Error:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Polar ${context} failed`,
    })
  }
}

export const ensurePolarCustomerSafe = (user: User) =>
  handlePolarEndpoint(() => ensurePolarCustomer(user), 'ensureCustomer')

export const setupPolarSafe = () =>
  handlePolarEndpoint(() => setupPolar(), 'setupPolar')