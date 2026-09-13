import { useState } from '#imports'
import { useProfileIdentity } from './useProfileIdentity'

/**
 * Gift-card and subscription panels for `/u/` (Commerce tab).
 *
 * Both come from the Magento GraphQL customer API and are gated on the
 * legacy customer-token cookie — when it's absent the panels stay in
 * their "unavailable" state, which is the expected pre-integration look.
 */
export function useProfileCommerce() {
  const { token } = useProfileIdentity()

  const giftCards = useState<any[]>('profile:gift-cards', () => [])
  const giftCardsAvailable = useState('profile:gift-cards-available', () => false)
  const giftCardsMessage = useState('profile:gift-cards-message', () => 'Gift card data is not exposed by the commerce API.')

  const subscriptions = useState<any[]>('profile:subscriptions', () => [])
  const subscriptionsAvailable = useState('profile:subscriptions-available', () => false)
  const subscriptionsMessage = useState('profile:subscriptions-message', () => 'Subscription data is not exposed by the commerce API.')

  const loadCommerceFeatures = async () => {
    if (!token.value) return

    const giftResponse = await $fetch<{ data?: any, errors?: Array<{ message?: string }> }>('/api/graphql', {
      method: 'POST',
      body: {
        query: `
          query CustomerGiftCards {
            customer {
              gift_cards {
                id
                code
                balance
                balanceLabel
              }
            }
          }
        `,
      },
    }).catch(() => ({ data: null, errors: [{ message: 'Gift cards endpoint unavailable' }] }))

    if (!giftResponse.errors?.length && Array.isArray(giftResponse.data?.customer?.gift_cards)) {
      giftCards.value = giftResponse.data.customer.gift_cards
      giftCardsAvailable.value = true
      giftCardsMessage.value = giftCards.value.length ? '' : 'No gift cards available.'
    }

    const subscriptionResponse = await $fetch<{ data?: any, errors?: Array<{ message?: string }> }>('/api/graphql', {
      method: 'POST',
      body: {
        query: `
          query CustomerSubscriptions {
            customer {
              subscriptions {
                id
                status
                name
                reference
              }
            }
          }
        `,
      },
    }).catch(() => ({ data: null, errors: [{ message: 'Subscriptions endpoint unavailable' }] }))

    if (!subscriptionResponse.errors?.length && Array.isArray(subscriptionResponse.data?.customer?.subscriptions)) {
      subscriptions.value = subscriptionResponse.data.customer.subscriptions
      subscriptionsAvailable.value = true
      subscriptionsMessage.value = subscriptions.value.length ? '' : 'No subscriptions found.'
    }
  }

  return {
    giftCards,
    giftCardsAvailable,
    giftCardsMessage,
    subscriptions,
    subscriptionsAvailable,
    subscriptionsMessage,
    loadCommerceFeatures,
  }
}
