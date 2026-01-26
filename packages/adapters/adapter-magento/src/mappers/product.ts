import { CommerceProduct, CommercePrice } from '@meeovi/types'
import { ProductInterface } from '../client/sdk'

export function mapMagentoProduct(product: ProductInterface): CommerceProduct {
  const price: CommercePrice = {
    amount: product.price_range.minimum_price.final_price.value as any,
    currency: product.price_range.minimum_price.final_price.currency as any,
  }

  return {
    id: product.uid,
    slug: product.url_key ?? product.sku as any,
    sku: product.sku as any,
    name: product.name as any,
    description: product.description?.html ?? '',
    shortDescription: product.short_description?.html ?? '',
    price,
    images: (product.media_gallery ?? []).map(img => ({
      url: img?.url ?? '',
      alt: img?.label ?? product.name,
    })) as any,
    categories: product.categories?.filter(c => c != null).map(c => (c as any).uid) ?? [],
    variants: [], // optional: map configurable variants
  }
}