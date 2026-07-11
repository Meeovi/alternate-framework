import { normalizeProduct } from './normalizers/product'
import { MyBackend_GetProductDocument } from './src/graphql/types'
import { $fetch } from 'ofetch'

export async function getProduct(id: string) {
  const res = await $fetch(`${process.env.MYBACKEND_ENDPOINT}`, {
    method: 'POST',
    body: {
      query: MyBackend_GetProductDocument.loc?.source.body,
      variables: { id }
    },
    headers: {
      Authorization: `Bearer ${process.env.MYBACKEND_TOKEN}`
    }
  })

  return normalizeProduct(res.data.product)
}
