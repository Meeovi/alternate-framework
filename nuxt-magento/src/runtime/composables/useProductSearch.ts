export const useProductSearch = () => {
  const { query } = useMagento()

  const searchProducts = async (search: string) => {
    const res = await query(`
      query GetProducts($search: String!) {
        products(search: $search) {
          items {
            id
            name
            sku
            price_range {
              minimum_price {
                regular_price { value currency }
              }
            }
          }
        }
      }
    `, { search })
    return res.data.products.items
  }

  return { searchProducts }
}
