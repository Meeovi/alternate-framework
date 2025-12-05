export const useCart = () => {
  const { query } = useMagento()

  const createCart = async () => {
    const res = await query(`mutation { createEmptyCart }`)
    return res.data.createEmptyCart
  }

  const addToCart = async (cartId: string, sku: string, qty: number) => {
    const res = await query(`
      mutation AddToCart($cartId: String!, $sku: String!, $qty: Float!) {
        addSimpleProductsToCart(
          input: {
            cart_id: $cartId,
            cart_items: [{ data: { sku: $sku, quantity: $qty } }]
          }
        ) {
          cart { items { product { name sku } quantity } }
        }
      }
    `, { cartId, sku, qty })
    return res.data.addSimpleProductsToCart.cart
  }

  return { createCart, addToCart }
}
