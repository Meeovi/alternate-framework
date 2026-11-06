<template>
  <div class="departmentPage">
    <div v-if="category?.slug === 'restaurants'">
      <v-toolbar :style="`background-color: ${category?.color}; color: ${category?.colortext}`"
        :title="category?.name" />
      <restaurants :category="category?.slug" />
    </div>

    <div v-else-if="category">
      <v-card variant="text">
        <v-toolbar :style="`background-color: ${category?.color}; color: ${category?.colortext}`">
          <v-toolbar-title>
            <template v-if="department">
              <NuxtLink :to="`/departments/${department.slug || department.name?.toLowerCase()}`">
                Meeovi {{ department.name }}
              </NuxtLink>
              -
            </template>
            <template v-if="category?.parent?.id">
              <NuxtLink :to="`/departments/category/${category.parent.id}`">{{ category.parent.name }}</NuxtLink>
              -
            </template>
            {{ category?.name }}
          </v-toolbar-title>
          <v-slide-group v-if="subcategories.length || category?.menus?.length" show-arrows>
            <v-slide-group-item v-if="subcategories.length" v-slot="{ isSelected }">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn :color="isSelected ? 'primary' : undefined" class="ma-2" v-bind="props" variant="text">
                    Categories
                  </v-btn>
                </template>

                <v-list class="departmentMenu">
                  <v-row>
                    <v-col v-for="sub in subcategories" :key="sub.id" cols="3">
                      <v-list-item>
                        <NuxtLink :to="`/departments/category/${sub.id}`">
                          {{ sub.name }}
                        </NuxtLink>
                      </v-list-item>
                    </v-col>
                  </v-row>
                </v-list>
              </v-menu>
            </v-slide-group-item>

            <v-slide-group-item v-for="menu in category.menus" :key="menu.id" v-slot="{ isSelected }">
              <v-btn :color="isSelected ? 'primary' : undefined" class="ma-2" :href="menu.url">
                {{ menu.name }}
              </v-btn>
            </v-slide-group-item>
          </v-slide-group>
        </v-toolbar>
      </v-card>

      <template v-if="products.length">
        <SortFilterBar :controller="productControls" :count="shownProducts.length" :total="products.length"
          noun="products" search-label="Search this category" />
        <v-row v-if="shownProducts.length" class="catSection">
          <v-col v-for="product in shownProducts" :key="product.id" cols="12" sm="6" md="4" lg="3">
            <ProductCard :product="product" />
          </v-col>
        </v-row>
        <div v-else class="text-center text-medium-emphasis py-10">
          No products match. <v-btn variant="text" @click="productControls.reset()">Clear filters</v-btn>
        </div>
      </template>
      <EmptyCategory v-else kind="category" :department-id="department?.id" :category-id="category?.id" />

      <!-- Notes, public lists, events and spaces about this category -->
      <TopicActivity v-if="category?.id" :category-id="category.id" />
    </div>

    <div v-else class="p-10 text-center text-xl text-medium-emphasis">
      Category not found...
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    ref,
    computed,
    watch
  } from 'vue'
  import ProductCard from '../../../components/catalog/product/productCard.vue'
  import EmptyCategory from '../../../components/catalog/emptyCategory.vue'
  import TopicActivity from '#social/app/components/related/topicActivity.vue'
  import {
    useAppGateway
  } from '#shared/app/composables/useAppGateway'
  import {
    useRoute,
    useNuxtApp,
    useHead,
    useRuntimeConfig
  } from '#imports'
  import { CommerceBackendRegistry } from 'alternate-sdk'
  import SortFilterBar from '#shared/app/components/SortFilterBar.vue'
  import { useSortFilter } from '#shared/app/composables/useSortFilter'
  import { productSortFilter } from '../../../utils/productSortFilter'
  import { PRODUCT_FIELDS } from '../../../utils/productFields'
  import Restaurants from '#social/app/components/features/spaceSections/restaurants.vue'

  const route = useRoute()
  const {
    $directus,
    $readItems
  } = useNuxtApp() as any

  const routeslug = computed(() => {
    const s = route.params.slug
    return Array.isArray(s) ? s[0] : s
  })

  const categoryKey = computed(() => {
    if (route.params.id) {
      return 'category-' + (Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
    }
    return 'category-' + routeslug.value
  })

  const {
    data: categoryRaw
  } = await useAsyncData<any>(() => categoryKey.value, async () => {
    try {
      // Links use either the category id (/departments/category/96) or its
      // slug (/departments/category/integrations).
      const key = route.params.id ? (Array.isArray(route.params.id) ? route.params.id[0] : route.params.id) : routeslug.value
      const filter = /^\d+$/.test(String(key ?? '')) ? {
        id: {
          _eq: key
        }
      } : {
        slug: {
          _eq: key
        }
      }
      const resp = await $directus.request($readItems('categories', {
        // Products with named columns, not `*` (utils/productFields.ts).
        fields: ['*', 'tags.tags_id.*', 'departments.departments_id.*',
          ...PRODUCT_FIELDS.map((f) => `products.products_id.${f}`),
          'products.products_id.image.*', 'menus.*', 'image.*',
          'parent.id', 'parent.name', 'parent.departments.departments_id.*',
          'children.id', 'children.name',
          ...PRODUCT_FIELDS.map((f) => `children.products.products_id.${f}`),
          'children.products.products_id.image.*'
        ],
        filter,
        limit: 1,
      }))
      return Array.isArray(resp?.data) ? resp.data[0] : (resp?.data || resp || [])[0] || null
    } catch {
      return null
    }
  })

  // Cross-references this category's products grid with whichever commerce
  // backend is active. See the matching comment in
  // departments/[...slug].vue — same rationale, same scope (category
  // metadata always stays Directus-sourced; only its products swap).
  // Uses categoryRaw.value.slug rather than routeslug.value: this page's
  // own route is a catch-all on `id`, so route.params.slug is effectively
  // always undefined here — the fetched record's own slug is the reliable
  // cross-reference key regardless of which route param resolved it.
  const activeCommerceBackend = useRuntimeConfig().public.commerceBackend || 'directus'

  const {
    data: backendCategoryProducts
  } = await useAsyncData(() => `${categoryKey.value}-backend-products`, async () => {
    if (!categoryRaw.value) return null
    // A category whose `uid` names its category in a commerce backend
    // (e.g. Integrations → Magento, where sellers list them) takes its
    // products from that backend even while the site's catalog is
    // Directus; otherwise only when the active backend isn't Directus.
    const adapter = (activeCommerceBackend !== 'directus'
      ? CommerceBackendRegistry.get(activeCommerceBackend)
      : categoryRaw.value.uid
        ? CommerceBackendRegistry.list().find((a: any) => a.id !== 'directus' && a.isEnabled?.() && typeof a.getProductsByCategory === 'function')
        : null) as any
    if (!adapter?.isEnabled?.() || typeof adapter.getProductsByCategory !== 'function') return null
    return adapter.getProductsByCategory({
      slug: categoryRaw.value.slug,
      externalId: categoryRaw.value.uid || undefined,
    })
  })

  if (backendCategoryProducts.value) {
    categoryRaw.value.products = backendCategoryProducts.value.map((product: any) => ({ products_id: product }))
  }

  const category = computed(() => categoryRaw.value as any)

  // A subcategory may only be linked to its department through its parent
  // (e.g. Travel › Photography › Pixanomy).
  const department = computed(() =>
    category.value?.departments?.[0]?.departments_id
    || category.value?.parent?.departments?.[0]?.departments_id
    || null)

  const subcategories = computed(() =>
    ((category.value?.children || []) as any[])
      .filter((c) => c?.id)
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))))

  // The category's own products, then its subcategories' (so Photography
  // shows its Travel photos), once each. When the products came from the
  // store, its category already holds its subcategories' products. A store
  // product and its Directus copy are the same product (same SKU). A
  // deleted product leaves its junction row behind with no product.
  const products = computed(() => {
    const seen = new Set()
    const rels = [
      ...(category.value?.products || []),
      ...(backendCategoryProducts.value ? [] : subcategories.value.flatMap((c: any) => c.products || [])),
    ]
    return rels
      .map((rel: any) => rel?.products_id)
      .filter((p: any) => {
        const key = p?.mageos_sku || p?.sku || p?.id
        return key && !seen.has(key) && seen.add(key)
      })
  })

  // Search, sort and filter the grid (price, subcategory, seller), kept in
  // the page address. A product's subcategory is the one it was listed
  // under here (store products have none).
  const productKeyOf = (p: any) => String(p?.mageos_sku || p?.sku || p?.id)
  const subcategoryOf = computed(() => {
    const map = new Map<string, Set<string>>()
    for (const sub of subcategories.value as any[]) {
      for (const rel of sub.products || []) {
        const p = rel?.products_id
        if (!p) continue
        const key = productKeyOf(p)
        if (!map.has(key)) map.set(key, new Set())
        map.get(key)!.add(String(sub.id))
      }
    }
    return map
  })
  const productControls = useSortFilter(productSortFilter('products', () => products.value, [{
    key: 'subcategory',
    title: 'Subcategory',
    multiple: true,
    options: () => (subcategories.value as any[])
      .filter((sub) => (sub.products || []).some((rel: any) => rel?.products_id))
      .map((sub) => ({ value: String(sub.id), title: sub.name })),
    match: (p: any, value: string) => !!subcategoryOf.value.get(productKeyOf(p))?.has(value),
  }]))
  const shownProducts = computed(() => productControls.apply(products.value))

  useHead({
    title: computed(() => category.value?.name || 'Category Page'),
  })
</script>

<style scoped>
.catSection {
  padding: 25px;
}
</style>