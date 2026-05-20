import { useMagentoGraphQL } from './useMagentoGraphQL'
import { PRODUCTS_QUERY, buildProductsVariables } from '../server/utils/graphqlQueries'

export function useMagentoGraphQLProducts() {
  const query = useMagentoGraphQL()

  return {
    list: (opts?: Parameters<typeof buildProductsVariables>[0]) =>
      query(PRODUCTS_QUERY, buildProductsVariables(opts || {})),
  }
}
