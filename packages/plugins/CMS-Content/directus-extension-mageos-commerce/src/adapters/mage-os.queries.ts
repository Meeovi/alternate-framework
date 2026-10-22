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

export const SEARCH_QUERY = `
  query Search($search: String!, $filter: ProductAttributeFilterInput, $sort: ProductAttributeSortInput, $pageSize: Int, $currentPage: Int, $facets: Boolean!) {
    products(search: $search, filter: $filter, sort: $sort, pageSize: $pageSize, currentPage: $currentPage) {
      total_count
      page_info { current_page page_size total_pages }
      items { ${PRODUCT_CARD_FIELDS} }
      aggregations @include(if: $facets) { attribute_code label options { label value count } }
    }
  }
`

export const SUGGEST_QUERY = `
  query Suggest($search: String!) {
    products(search: $search, pageSize: 10) { items { name } }
  }
`

export const STORE_CONFIG_QUERY = `
  query StoreConfig {
    storeConfig {
      store_code store_name base_currency_code default_display_currency_code locale
      base_media_url copyright product_reviews_enabled allow_guests_to_write_product_reviews
    }
  }
`

const REVIEW_FIELDS = 'nickname summary text created_at average_rating ratings_breakdown { name value }'

export const PRODUCT_REVIEWS_QUERY = `
  query ProductReviews($sku: String!, $pageSize: Int) {
    products(filter: { sku: { eq: $sku } }, pageSize: 1) {
      items { sku reviews(pageSize: $pageSize) { items { ${REVIEW_FIELDS} } } }
    }
  }
`

export const REVIEW_RATINGS_QUERY = `
  query ReviewRatings {
    productReviewRatingsMetadata { items { id name values { value_id value } } }
  }
`

export const CREATE_REVIEW_MUTATION = `
  mutation CreateReview($input: CreateProductReviewInput!) {
    createProductReview(input: $input) { review { ${REVIEW_FIELDS} } }
  }
`

export const CATEGORY_BY_SLUG_QUERY = `
  query CategoryBySlug($slug: String!) {
    categories(filters: { url_key: { eq: $slug } }, pageSize: 1) { items { uid } }
  }
`

export const CREATE_CUSTOMER_MUTATION = `
  mutation CreateCustomer($input: CustomerCreateInput!) {
    createCustomerV2(input: $input) { customer { email firstname lastname } }
  }
`

export const CUSTOMER_TOKEN_MUTATION = `
  mutation CustomerToken($email: String!, $password: String!) {
    generateCustomerToken(email: $email, password: $password) { token }
  }
`
