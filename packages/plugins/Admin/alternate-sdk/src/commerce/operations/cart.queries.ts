export const GetCartQuery = `
  query GetCart($cartId: ID) {
    cart(cartId: $cartId) {
      id
      items {
        id
        productId
        variantId
        quantity
        price { regular { value currencyCode } current { value currencyCode } }
      }
      totalPrice { regular { value currencyCode } current { value currencyCode } }
    }
  }
`

export const AddToCartMutation = `
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      id
      items {
        id
        productId
        variantId
        quantity
        price { regular { value currencyCode } current { value currencyCode } }
      }
      totalPrice { regular { value currencyCode } current { value currencyCode } }
    }
  }
`

export const UpdateCartMutation = `
  mutation UpdateCart($input: UpdateCartInput!) {
    updateCart(input: $input) {
      id
      items {
        id
        productId
        variantId
        quantity
        price { regular { value currencyCode } current { value currencyCode } }
      }
      totalPrice { regular { value currencyCode } current { value currencyCode } }
    }
  }
`

export const RemoveFromCartMutation = `
  mutation RemoveFromCart($itemId: ID!) {
    removeFromCart(itemId: $itemId) {
      id
      items { id productId quantity }
      totalPrice { value currencyCode }
    }
  }
`

export const ClearCartMutation = `
  mutation ClearCart($cartId: ID!) {
    clearCart(cartId: $cartId) { success }
  }
`

export const GetCartPriceRulesQuery = `
  query GetCartPriceRules($cartId: ID) {
    cartPriceRules(cartId: $cartId) {
      id
      name
      conditions
      actions
    }
  }
`