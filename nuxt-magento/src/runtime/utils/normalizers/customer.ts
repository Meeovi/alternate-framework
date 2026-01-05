export interface NormalizedCustomer {
  id: number
  email: string
  firstname: string
  lastname: string
}

export function normalizeCustomer(c: any): NormalizedCustomer {
  return {
    id: c.id,
    email: c.email,
    firstname: c.firstname,
    lastname: c.lastname
  }
}
