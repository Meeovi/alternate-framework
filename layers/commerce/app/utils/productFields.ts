/**
 * A product's own columns in Directus, to ask for instead of `*`.
 *
 * `*` also returns all 39 relation lists a product has (orders, lists,
 * comments, coupons, …) as bare ids, and Directus reads each one with its
 * own database query. The database is in Frankfurt and this server in
 * Canada (~95 ms a query), so one product with `*` took 5–9 s uncached and
 * the product page's read 13–21 s. With named fields a list of 12 products
 * went from 5.7 s to 1.3 s, and the product page's read to about 3 s.
 * Relations a page needs are added to the list explicitly
 * (e.g. 'categories.categories_id.*').
 *
 * A new column added to `products` in Directus must be added here before
 * the site shows it.
 */
export const PRODUCT_FIELDS = [
  'id', 'sku', 'name', 'slug', 'type', 'status', 'visibility', 'source', 'uuid',
  'content', 'short_description', 'meta_title', 'meta_description',
  'image', 'image_url', 'file', 'gallery',
  'price', 'regular_price', 'currency_code', 'discountPercent', 'tax_class',
  'manufacturer_suggested_retail_price', 'minimum_advertised_price',
  'stock', 'in_stock', 'salable_quantity', 'part_number',
  'rating', 'ratings', 'is_featured', 'product_channel',
  'options', 'variants',
  'mageos_id', 'mageos_sku', 'mageos_synced_at', 'mageos_attributes',
  'coordinates', 'latitude', 'longitude', 'location_name',
  'download_url', 'allow_free_download',
  'seller_username', 'seller_name',
  'created_at', 'updated_at',
]
