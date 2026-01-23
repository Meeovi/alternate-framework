export interface ShippingInformationPayload {
  cartId: string
  email?: string
  shippingAddress: any
  billingAddress: any
  shippingMethod: {
    carrier_code: string
    method_code: string
  }
}

export interface PlaceOrderPayload {
  cartId: string
  paymentMethod: {
    method: string
    additional_data?: Record<string, any>
  }
  billingAddress: any
}

export interface CreatePaymentIntentPayload {
  provider: string
  cartId: string
  amount: number
}
