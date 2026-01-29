import type { Maybe } from '../../../composables/_types'

export interface Address {
  streetNumber?: Maybe<string>
  phone?: Maybe<string>
  streetName?: Maybe<string>
  [key: string]: any
}

export type CheckoutAddressProps = {
  type: 'billingAddress' | 'shippingAddress'
  heading: string
  description: string
  buttonText: string
  savedAddress?: Maybe<Address>
}
