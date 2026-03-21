/**
 * Magento GraphQL Field Mapping
 *
 * Maps Magento 2.4 GraphQL schema fields to the unified commerce domain types.
 * This provides a reference for extending and customizing Magento adapter behavior.
 *
 * Magento GraphQL Docs: https://devdocs.magento.com/guides/v2.4/graphql/index.html
 */

/**
 * Product field mappings
 *
 * Maps Magento products to unified SfProduct type
 */
export const productMapping = {
  // Magento -> Unified Commerce Domain
  id: 'id', // Magento id
  name: 'name',
  sku: 'sku',
  description: 'description',
  shortDescription: 'short_description',
  price: 'price', // SfMoney
  specialPrice: 'special_price',
  image: 'image', // SfImage[] - Magento provides thumbnail, small_image, image
  images: 'media_gallery',
  categories: 'categories',
  stock: 'stock_status', // Magento stock_status, quantity
  rating: 'reviews',
  visibility: 'visibility',
  status: 'status',
  typeId: 'type_id', // simple, configurable, bundle, etc.
  attributes: 'attributes',
  relatedProducts: 'related_products',
  upsellProducts: 'upsell_products'
}

/**
 * Cart field mappings
 *
 * Maps Magento cart to unified SfCart type
 */
export const cartMapping = {
  id: 'id',
  email: 'email',
  items: 'items', // SfCartLineItem[]
  itemsCount: 'items_count',
  subtotal: 'subtotal', // SfMoney
  discounts: 'discount', // SfMoney
  shipping: 'shipping', // SfMoney
  tax: 'tax', // SfMoney
  total: 'grand_total', // SfMoney
  currency: 'currency_code',
  notes: 'notes',
  shippingAddress: 'shipping_address', // SfAddress
  billingAddress: 'billing_address' // SfAddress
}

/**
 * Cart line item field mappings
 */
export const cartLineItemMapping = {
  id: 'id',
  product: 'product', // Product reference
  productId: 'product_id',
  quantity: 'quantity',
  price: 'price', // SfMoney (per unit)
  subtotal: 'subtotal', // SfMoney (qty * price)
  discount: 'discount', // SfMoney
  total: 'total_price', // SfMoney
  options: 'customizable_options' // Selected attributes/options
}

/**
 * Address field mappings
 */
export const addressMapping = {
  id: 'id',
  firstName: 'firstname',
  firstName: 'lastName', // Maps to lastname
  company: 'company',
  street: 'street', // Array[0] is street line 1
  streetNumber: 'street', // Can be extracted from street[0]
  streetLine2: 'street', // street[1]
  city: 'city',
  region: 'region', // CodePath: region { region_code, region_id }
  regionCode: 'region.region_code',
  postcode: 'postcode',
  country: 'country_id', // 2-letter ISO code
  phone: 'telephone',
  default: 'default_shipping' // or default_billing
}

/**
 * Customer field mappings
 */
export const customerMapping = {
  id: 'id',
  email: 'email',
  firstName: 'firstname',
  lastName: 'lastname',
  phone: 'telephone', // From default address
  addresses: 'addresses', // SfAddress[]
  orders: 'orders', // SfOrder[] - only visible to customer
  createdAt: 'created_at',
  newsletter: 'is_subscribed'
}

/**
 * Order field mappings
 */
export const orderMapping = {
  id: 'id',
  number: 'order_number',
  status: 'status',
  items: 'items', // SfOrderLineItem[]
  customer: 'customer', // SfCustomer ref
  shippingAddress: 'shipping_address', // SfAddress
  billingAddress: 'billing_address', // SfAddress
  subtotal: 'subtotal', // SfMoney
  discounts: 'discount_amount', // SfMoney
  shipping: 'shipping_amount', // SfMoney
  tax: 'tax_amount', // SfMoney
  total: 'grand_total', // SfMoney
  currency: 'order_currency_code',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  shipments: 'shipments', // Fulfillment tracking
  invoices: 'invoices'
}

/**
 * Category field mappings
 */
export const categoryMapping = {
  id: 'id',
  name: 'name',
  description: 'description',
  image: 'image', // SfImage
  slug: 'url_key',
  parentId: 'parent_id',
  children: 'children', // Recursive
  isActive: 'is_active',
  includedInMenu: 'include_in_menu',
  products: 'products', // Connection with filters
  breadcrumbs: 'breadcrumbs'
}

/**
 * Magento-specific GraphQL query patterns
 *
 * Common Magento GraphQL operations and their structure
 */
export const magentoQueryPatterns = {
  // Get product by SKU
  getProductBySku: `
    query GetProductBySku($sku: String!) {
      products(filter: { sku: { eq: $sku } }) {
        items {
          id
          name
          sku
          price_range { minimum_price { regular_price { value currency } } }
        }
      }
    }
  `,

  // Get cart
  getCart: `
    query GetCart($cartId: String!) {
      cart(cart_id: $cartId) {
        id
        items { id product_id quantity }
        prices {
          grand_total { value currency }
          subtotal_including_tax { value }
        }
      }
    }
  `,

  // Get customer
  getCustomer: `
    query GetCustomer {
      customer {
        id
        email
        firstname
        lastname
        addresses { id firstname lastname street city region postcode }
      }
    }
  `,

  // Get orders
  getCustomerOrders: `
    query GetCustomerOrders {
      customer {
        orders(pageSize: 20) {
          items {
            id
            order_number
            status
            created_at
            grand_total
          }
        }
      }
    }
  `
}

/**
 * Magento authentication patterns
 *
 * Different auth methods and header requirements
 */
export const magentoAuthPatterns = {
  // Bearer token (customer token or API token)
  bearer: {
    header: 'Authorization',
    value: 'Bearer {token}'
  },

  // API key (for admin/service accounts)
  apiKey: {
    header: 'X-Magento-Authorization',
    value: 'Bearer {api_key}'
  },

  // OAuth (for third-party integrations)
  oauth: {
    header: 'Authorization',
    value: 'Bearer {oauth_token}'
  }
}
