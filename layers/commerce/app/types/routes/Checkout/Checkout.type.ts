export interface CheckoutAddress {
  company?: string
  city?: string
  country_id?: string
  firstname?: string
  lastname?: string
  postcode?: string
  street?: Array<string | null>
  telephone?: string
  region?: string
  region_id?: number
  region_code?: string
  vat_id?: string
}
