export interface NormalizedCustomer {
  id: number
  email: string
  firstname: string
  lastname: string
}

export function normalizeCustomerREST(raw: any): NormalizedCustomer {
  return {
    id: raw.id,
    email: raw.email,
    firstname: raw.firstname,
    lastname: raw.lastname,
  }
}
