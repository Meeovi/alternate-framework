<template>
  <CatalogProductCard v-if="isProduct" :product="productModel" />

  <v-card v-else class="result-card" variant="outlined" v-bind="linkBinding">
    <v-img v-if="image" :src="image" :alt="title" height="160" cover class="result-card__image" />

    <v-card-item>
      <template v-if="typeLabel" #prepend>
        <v-chip size="x-small" variant="tonal" color="primary">{{ typeLabel }}</v-chip>
      </template>
      <v-card-title class="result-card__title">{{ title }}</v-card-title>
      <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <p class="result-card__description">{{ description }}</p>
      <strong v-if="formattedPrice" class="result-card__price">{{ formattedPrice }}</strong>
    </v-card-text>

    <v-card-actions v-if="link">
      <v-btn variant="text" color="primary" v-bind="linkBinding">View details</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getAssetURL } from '#shared/app/utils/get-asset-url'

const props = defineProps<{
  item: Record<string, unknown>
}>()

function firstValue(keys: string[]): unknown {
  for (const key of keys) {
    const value = props.item?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return null
}

// Result documents come from an OpenSearch index that can be fed by many
// backends (products, posts, listings, profiles, ...). A `type` field (once
// producers populate it) tells us how to render a hit; anything untyped is
// treated as a product, since that's the only content indexed today.
const type = computed(() => {
  const raw = firstValue(['type', 'entity_type', 'model', '_type'])
  return raw ? String(raw).trim().toLowerCase() : null
})

const isProduct = computed(() => !type.value || type.value === 'product' || type.value === 'products')

const typeLabel = computed(() => {
  if (!type.value) return null
  return type.value.charAt(0).toUpperCase() + type.value.slice(1)
})

const title = computed(() => String(firstValue(['title', 'name', 'label', 'product_name']) || 'Untitled'))
const subtitle = computed(() => {
  const value = firstValue(['brand', 'category', 'author', 'seller'])
  return value ? String(value) : null
})
const description = computed(() => {
  const value = firstValue(['description', 'body', 'summary', 'excerpt', 'content'])
  return value ? String(value) : 'No description available.'
})

function resolveImageUrl(raw: unknown): string | null {
  if (!raw) return null
  if (typeof raw === 'string' && /^(https?:)?\/\//.test(raw)) return raw
  if (typeof raw === 'string' && raw.startsWith('/')) return raw
  return getAssetURL(raw)
}

const image = computed(() => resolveImageUrl(firstValue(['image', 'thumbnail', 'photo', 'picture', 'avatar'])))

const price = computed(() => {
  const value = firstValue(['price', 'amount', 'final_price'])
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
})

const formattedPrice = computed(() => {
  if (price.value === null) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price.value)
})

const link = computed(() => {
  const externalUrl = firstValue(['url', 'link', 'permalink'])
  if (externalUrl && /^https?:\/\//i.test(String(externalUrl))) {
    return { href: String(externalUrl), external: true }
  }

  const slug = firstValue(['slug', 'handle'])
  const id = firstValue(['id', 'objectID', '_id'])
  const segment = type.value || 'item'

  if (slug) return { href: `/${segment}/${slug}`, external: false }
  if (id) return { href: `/${segment}/${id}`, external: false }
  return null
})

const linkBinding = computed(() => {
  if (!link.value) return {}
  if (link.value.external) {
    return { href: link.value.href, target: '_blank', rel: 'noreferrer' }
  }
  return { to: link.value.href }
})

const productModel = computed(() => {
  const item = props.item
  return {
    id: item.id ?? item.objectID ?? item._id,
    name: title.value,
    image: item.image ?? item.thumbnail ?? item.photo ?? null,
    rating: Number(firstValue(['rating', 'average_rating', 'stars']) ?? 0) || 0,
    price: item.price,
    price_range: item.price_range,
    regular_price: item.regular_price,
    special_price: item.special_price,
    sale_price: item.sale_price,
    shops: item.shops ?? ((item.brand || item.seller) ? { shops_id: { name: item.brand ?? item.seller } } : undefined),
  }
})
</script>

<style scoped>
.result-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.result-card__title {
  white-space: normal;
  line-height: 1.3;
}

.result-card__description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.result-card__price {
  font-size: 1.05rem;
}
</style>
