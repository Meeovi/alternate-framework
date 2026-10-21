<template>
  <div v-if="mode">
    <v-btn v-if="mode === 'cart'" color="orange" variant="outlined" :disabled="loading" :loading="loading"
      @click="handleAddToCart" prepend-icon="fas fa-shopping-cart">
      {{ buttonLabel }}
    </v-btn>

    <v-btn v-else-if="mode === 'download'" color="orange" variant="outlined" prepend-icon="fas fa-download"
      :href="downloadUrl" download>
      Download
    </v-btn>

    <template v-else-if="mode === 'install'">
      <v-btn v-if="integration?.state === 'installed'" color="success" variant="outlined" prepend-icon="fas fa-check"
        :to="integrationUrl">
        Installed
      </v-btn>
      <v-btn v-else-if="integration?.state === 'coming-soon'" variant="outlined" disabled>
        Coming soon
      </v-btn>
      <v-btn v-else color="orange" variant="outlined" prepend-icon="fas fa-plus"
        :loading="loading" :disabled="loading" @click="handleInstall">
        Install
      </v-btn>
      <p v-if="installError" class="add-to-cart__error">{{ installError }}</p>
    </template>
  </div>
</template>

<script setup>
  import { reuseServerData } from '#shared/app/utils/reuseServerData'
  import {
    ref,
    computed,
    onMounted
  } from 'vue'
  import {
    useCartStore
  } from '~/stores/cart'
  import { getAssetURL } from '#shared/app/utils/get-asset-url'
  import { productKey } from '../../utils/productKey'

  /**
   * The product's buy action:
   *  - an integration's product (its plugin's manifest names this SKU —
   *    @mframework/meeovi-integrations): Install / Installed when the user
   *    may use it (free, bought, or theirs to sell), Add to Cart while it's
   *    paid and not bought
   *  - priced above 0      → Add to Cart
   *  - free with a file    → Download
   *  - anything else free  → nothing
   */
  const props = defineProps({
    product: {
      type: [Object, String, Number],
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
  })

  const cart = useCartStore()
  const loading = ref(false)
  const route = useRoute()

  const productObject = computed(() => (typeof props.product === 'object' && props.product !== null ? props.product : null))

  // Directus id, or `magento:<sku>` for a commerce backend's product.
  const productId = computed(() => (productObject.value ? productKey(productObject.value) || null : props.product))

  const productSku = computed(() => {
    if (productObject.value) {
      return productObject.value.sku ?? productObject.value.uid ?? String(productObject.value.id ?? '')
    }
    return String(props.product ?? '')
  })

  const productName = computed(() => productObject.value?.name ?? '')

  // Directus decimals arrive as strings ("0.00000"), so compare numbers.
  const productPrice = computed(() => {
    const price = Number(productObject.value?.price ?? productObject.value?.price_range?.minimum_price?.regular_price?.value ?? 0)
    return Number.isFinite(price) ? price : 0
  })

  const downloadUrl = computed(() => getAssetURL(productObject.value?.file) ?? undefined)

  // ---- Integration products (@mframework/meeovi-integrations)

  const integrationsConfig = useRuntimeConfig().public.meeoviIntegrations
  const integrationsApi = integrationsConfig?.apiBase || ''
  // Integrations are sold as commerce-backend products (`source` set), so
  // only those buttons ask — one catalog request per page (shared key).
  const sellsIntegrations = Boolean(integrationsApi && typeof props.product === 'object' && props.product?.source)
  const request = useRequestFetch()
  const { data: integrationCatalog } = sellsIntegrations
    ? useAsyncData(
      'meeovi-integrations:store-catalog',
      () => request(integrationsApi).catch(() => ({ items: [] })),
      { default: () => ({ items: [] }), getCachedData: reuseServerData },
    )
    : { data: ref({ items: [] }) }
  // The integration this product sells: its plugin names this SKU.
  const integration = computed(() => {
    const key = productId.value
    if (!key || !productObject.value?.source) return null
    return (integrationCatalog.value?.items ?? []).find((item) => item.productRef && item.productRef === key) ?? null
  })
  const integrationUrl = computed(() => {
    const base = integrationsConfig?.catalogUrl || integrationsConfig?.catalogPath || '/workspace/integration'
    return `${String(base).replace(/\/+$/, '')}/${integration.value?.slug ?? ''}`
  })

  // A bare id carries no price, so it can only be a cart item.
  const mode = computed(() => {
    if (!productObject.value) return 'cart'
    if (integration.value) return integration.value.state === 'paid' ? 'cart' : 'install'
    if (productPrice.value > 0) return 'cart'
    if (downloadUrl.value) return 'download'
    return null
  })

  // ---- Cart

  // A listing page can mount dozens of these at once — the store dedupes
  // concurrent calls into a single request, so this doesn't fan out into
  // one fetch per button.
  onMounted(() => {
    if (mode.value === 'cart') cart.fetchCart()
  })

  const inCartItem = computed(() => {
    if (!productId.value) return null
    // item.id is now the cart line's own database id (see server/utils/
    // cart.ts's serializeCart), not the product id — only productId
    // identifies which product a line item is for.
    return cart.items.find((item) => String(item.productId) === String(productId.value))
  })

  const inCartQty = computed(() => inCartItem.value?.quantity ?? 0)

  const buttonLabel = computed(() => {
    if (inCartQty.value > 0) return `In Cart (${inCartQty.value})`
    return 'Add to Cart'
  })

  const handleAddToCart = async () => {
    if (!productId.value || loading.value) return

    const qtyToAdd = Number.isFinite(props.quantity) ? props.quantity : 1

    try {
      loading.value = true
      // The cart API merges into an existing line item itself (same
      // product, re-priced from the catalog) — no need to special-case an
      // already-in-cart product here, just always add the requested qty.
      await cart.addItem({
        productId: productId.value,
        id: productId.value,
        sku: productSku.value,
        name: productName.value,
        price: productPrice.value,
        qty: qtyToAdd,
        quantity: qtyToAdd,
      })
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    } finally {
      loading.value = false
    }
  }

  // ---- Integration install

  const installError = ref('')

  const handleInstall = async () => {
    const slug = integration.value?.slug
    if (!slug || loading.value) return
    installError.value = ''
    try {
      loading.value = true
      await $fetch(`${integrationsApi}/${encodeURIComponent(slug)}/install`, { method: 'POST' })
      await refreshNuxtData(['meeovi-integrations:store-catalog', 'meeovi-integrations:installed'])
    } catch (error) {
      const status = error?.statusCode ?? error?.status
      if (status === 401) {
        await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
        return
      }
      installError.value = error?.data?.statusMessage || error?.statusMessage || 'Could not install it. Try again.'
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
.add-to-cart__error {
  margin-top: 4px;
  font-size: 0.8rem;
  color: rgb(var(--v-theme-error));
}
</style>
