import { normalizeProductGraphQL } from '../normalizers/product'

query: async (query, variables) => {
  const res = await $('/graphql', { method: 'POST', body: { query, variables } })
  return {
    ...res,
    products: res.products
      ? {
          items: res.products.items.map(normalizeProductGraphQL),
          total: res.products.total_count,
        }
      : undefined,
  }
}
