export function mapMagentoProduct(product) {
    const price = {
        amount: product.price_range.minimum_price.final_price.value,
        currency: product.price_range.minimum_price.final_price.currency,
    };
    return {
        id: product.uid,
        slug: product.url_key ?? product.sku,
        sku: product.sku,
        name: product.name,
        description: product.description?.html ?? '',
        shortDescription: product.short_description?.html ?? '',
        price,
        images: (product.media_gallery ?? []).map(img => ({
            url: img?.url ?? '',
            alt: img?.label ?? product.name,
        })),
        categories: product.categories?.filter(c => c != null).map(c => c.uid) ?? [],
        variants: [], // optional: map configurable variants
    };
}
