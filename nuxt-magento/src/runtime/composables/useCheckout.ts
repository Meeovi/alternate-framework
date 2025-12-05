export const useCheckout = () => {
  const { query } = useMagento()

  const setShipping = async (cartId: string, address: any) => {
    const res = await query(`
      mutation SetShipping($cartId: String!, $address: CartAddressInput!) {
        setShippingAddressesOnCart(
          input: { cart_id: $cartId, shipping_addresses: [{ address: $address }] }
        ) {
          cart { shipping_addresses { firstname lastname street city postcode } }
        }
      }
    `, { cartId, address })
    return res.data.setShippingAddressesOnCart.cart
  }

  const placeOrder = async (cartId: string, paymentMethod: any) => {
    const res = await query(`
      mutation PlaceOrder($cartId: String!, $paymentMethod: PaymentMethodInput!) {
        placeOrder(input: { cart_id: $cartId, payment_method: $paymentMethod }) {
          order { order_number }
        }
      }
    `, { cartId, paymentMethod })
    return res.data.placeOrder.order
  }

  return { setShipping, placeOrder }
}
