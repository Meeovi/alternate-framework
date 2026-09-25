export const GetCheckoutQuery = `
  query GetCheckout($checkoutId: ID!) {
    checkout(checkoutId: $checkoutId) {
      id
      status
      totalPrice { regular { value currencyCode } current { value currencyCode } }
      items {
        id
        productId
        variantId
        quantity
        price { regular { value currencyCode } current { value currencyCode } }
      }
    }
  }
`

export const CreateCheckoutMutation = `
  mutation CreateCheckout($input: CheckoutInput!) {
    createCheckout(input: $input) {
      id
      status
      totalPrice { regular { value currencyCode } current { value currencyCode } }
      items { id productId quantity }
    }
  }
`

export const UpdateCheckoutMutation = `
  mutation UpdateCheckout($checkoutId: ID!, $input: CheckoutInput!) {
    updateCheckout(checkoutId: $checkoutId, input: $input) {
      id
      status
      totalPrice { value currencyCode }
    }
  }
`

export const CompleteCheckoutMutation = `
  mutation CompleteCheckout($checkoutId: ID!) {
    completeCheckout(checkoutId: $checkoutId) { success }
  }
`