// Plain JS normalizers used for a no-install smoke test
function normalizeProduct(p) {
  const descriptionAttr = (p.custom_attributes || []).find(
    (a) => a.attribute_code === 'description'
  )

  return {
    id: p.id,
    sku: p.sku,
    title: p.name,
    description: descriptionAttr && descriptionAttr.value ? descriptionAttr.value : undefined,
    price: p.price ?? (p.price_range && p.price_range.minimum_price && p.price_range.minimum_price.regular_price && p.price_range.minimum_price.regular_price.value),
    images: (p.media_gallery_entries || []).map((i) => i.file),
    type: p.type_id
  }
}

function normalizeCart(c) {
  const id = c.id ?? c.cart_id ?? c.quote_id
  const items = (c.items || []).map((i) => ({
    id: i.item_id ?? Number(i.id),
    sku: i.sku ?? (i.product && i.product.sku),
    qty: i.qty ?? i.quantity,
    name: i.name ?? (i.product && i.product.name),
    price: i.price ?? (i.prices && i.prices.price && i.prices.price.value) ?? 0
  }))

  return { id, items, totals: c.totals }
}

function normalizeCustomer(c) {
  return {
    id: c.id,
    email: c.email,
    firstname: c.firstname,
    lastname: c.lastname
  }
}

module.exports = { normalizeProduct, normalizeCart, normalizeCustomer }
