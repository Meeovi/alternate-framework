import { createNormalizer } from '@meeovi/normalizer-core'
import { validate, validators } from '@meeovi/normalizer-core'
import type { CustomerGQL } from '../../types/graphql'

export interface NormalizedCustomer {
  id: number
  email: string
  firstname: string
  lastname: string
}

const customerSchema = {
  id: validators.number,
  email: validators.string,
  firstname: validators.string,
  lastname: validators.string
}

export const normalizeCustomer = createNormalizer<CustomerGQL | any, NormalizedCustomer>((c) => {
  const mapped = {
    id: c.id,
    email: c.email,
    firstname: c.firstname,
    lastname: c.lastname
  }

  return validate<NormalizedCustomer>(customerSchema as any, mapped)
})
