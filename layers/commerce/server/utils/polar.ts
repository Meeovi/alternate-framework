import type { Benefit } from '@polar-sh/sdk/models/components/benefit.js'
import type { BenefitGrantWebhook } from '@polar-sh/sdk/models/components/benefitgrantwebhook.js'
import type { Checkout } from '@polar-sh/sdk/models/components/checkout.js'
import type { Customer } from '@polar-sh/sdk/models/components/customer.js'
import type { CustomerState } from '@polar-sh/sdk/models/components/customerstate.js'
import type { Order } from '@polar-sh/sdk/models/components/order.js'
import type { Organization } from '@polar-sh/sdk/models/components/organization.js'
import type { Product } from '@polar-sh/sdk/models/components/product.js'
import type { Refund } from '@polar-sh/sdk/models/components/refund.js'
import type { Subscription } from '@polar-sh/sdk/models/components/subscription.js'
import { checkout, polar, portal, usage, webhooks } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import type { User } from 'alternate-sdk/contracts'
import { createPrismaClient } from '@mframework/adapter-prisma'
import { useRuntimeConfig } from '#imports'

const getRuntimeConfig = () => useRuntimeConfig()

const createPolarClient = () => {
  const runtimeConfig = getRuntimeConfig()

  return new Polar({
    accessToken: runtimeConfig.polarAccessToken as string,
    server: (runtimeConfig.polarServer as 'sandbox' | 'production') || 'sandbox',
  })
}

export const getPolarClient = createPolarClient

export const ensurePolarCustomer = async (user: User) => {
  const client = createPolarClient()
  const { result: existingCustomers } = await client.customers.list({ email: user.email })
  const existingCustomer = existingCustomers.items[0]
  if (existingCustomer) {
    if (existingCustomer.externalId !== user.id) {
      await client.customers.update({
        id: existingCustomer.id,
        customerUpdate: {
          externalId: user.id
        }
      })
    }
    return existingCustomer
  } else {
    const customer = await client.customers.create({
      email: user.email,
      name: user.name,
      externalId: user.id
    })
    return customer
  }
}

const addPaymentLog = async (
  hookType: string,
  data:
    | Customer
    | Checkout
    | Benefit
    | BenefitGrantWebhook
    | Order
    | Organization
    | Product
    | Refund
    | Subscription
    | CustomerState
    | Record<string, any>
) => {
  if (hookType.startsWith('checkout.')) {
    const checkoutData = data as Checkout
    const productName = checkoutData.product?.name || 'unknown-product'
    console.info('[polar webhook]', `polar:${hookType}:${productName}`)
  } else if (hookType.startsWith('customer.')) {
    const customer = data as Customer

    if (hookType == 'customer.created' && customer.externalId) {
      const prisma = createPrismaClient()
      await prisma.user.updateMany({
        where: { id: customer.externalId as any },
        data: { polarCustomerId: customer.id } as any,
      })
    }

    console.info('[polar webhook]', `polar:${hookType}`, {
      externalId: customer.externalId || undefined,
    })
  } else if (hookType.startsWith('subscription.')) {
    const subscription = data as Subscription
    const subscriptionProduct = subscription.product?.name || 'unknown-product'

    console.info('[polar webhook]', `polar:${hookType}:${subscriptionProduct}`, {
      externalId: subscription.customer?.externalId || undefined,
    })
  }
}

export const setupPolar = () => {
  const runtimeConfig = getRuntimeConfig()

  return polar({
    client: createPolarClient(),
    createCustomerOnSignUp: runtimeConfig.public.payment == 'polar',
    use: [
      checkout({
        products: [
          {
            productId: runtimeConfig.polarProductIdProMonth,
            slug: 'pro-monthly'
          },
          {
            productId: runtimeConfig.polarProductIdProYear,
            slug: 'pro-yearly'
          }
        ],
        successUrl: '/',
        authenticatedUsersOnly: true
      }),
      portal(),
      usage(),
      webhooks({
        // On Polar Organization Settings: {APP_URL}/api/auth/polar/webhooks
        secret: runtimeConfig.polarWebhookSecret,
        onPayload: async (payload) => {
          // Catch-all for all events
          await addPaymentLog(payload.type || '', payload.data as Record<string, any>)
        }
      })
    ]
  })
}