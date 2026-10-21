/**
 * Mage-OS / Magento 2 storefront GraphQL documents. Fields verified against
 * Mage-OS 2.2 (custom_attributesV2 needs Magento 2.4.7+ / Mage-OS 1.0+).
 */

const PRICE_RANGE = `price_range {
    minimum_price {
      regular_price { value currency }
      final_price { value currency }
    }
  }`

/** Enough for listing pages (cards, grids). */
export const PRODUCT_CARD_FIELDS = `
  __typename
  uid
  sku
  name
  url_key
  updated_at
  stock_status
  ${PRICE_RANGE}
  image { url label }
  small_image { url }
  media_gallery { url label position disabled }
  categories { uid name url_key url_path }
  ... on ConfigurableProduct {
    configurable_options {
      attribute_code
      label
      values { label value_index swatch_data { value } }
    }
  }
`

/** Everything the product page needs. */
export const PRODUCT_DETAIL_FIELDS = `
  ${PRODUCT_CARD_FIELDS}
  only_x_left_in_stock
  description { html }
  short_description { html }
  meta_title
  meta_description
  custom_attributesV2 {
    items {
      code
      ... on AttributeValue { value }
      ... on AttributeSelectedOptions { selected_options { label value } }
    }
  }
  ... on ConfigurableProduct {
    variants {
      attributes { code value_index label }
      product {
        uid
        sku
        stock_status
        ${PRICE_RANGE}
      }
    }
  }
`

export const PRODUCTS_QUERY = `
  query Products($search: String, $filter: ProductAttributeFilterInput, $sort: ProductAttributeSortInput, $pageSize: Int, $currentPage: Int) {
    products(search: $search, filter: $filter, sort: $sort, pageSize: $pageSize, currentPage: $currentPage) {
      total_count
      page_info { current_page page_size total_pages }
      items { ${PRODUCT_CARD_FIELDS} }
    }
  }
`

export const PRODUCT_BY_SLUG_QUERY = `
  query ProductBySlug($slug: String!) {
    products(filter: { url_key: { eq: $slug } }, pageSize: 1) {
      items { ${PRODUCT_DETAIL_FIELDS} }
    }
  }
`

export const ROOT_CATEGORY_QUERY = `
  query RootCategory {
    storeConfig { root_category_uid }
  }
`

const CATEGORY_FIELDS = 'uid name url_key url_path level position include_in_menu product_count'

/** The category tree below `$uid`, `depth` levels deep (GraphQL has no recursion). */
export function categoryTreeQuery(depth: number): string {
  let selection = CATEGORY_FIELDS
  for (let i = 0; i < depth; i++) selection = `${CATEGORY_FIELDS} children { ${selection} }`
  return `
    query CategoryTree($uid: String!) {
      categories(filters: { category_uid: { eq: $uid } }) {
        items { ${selection} }
      }
    }
  `
}
