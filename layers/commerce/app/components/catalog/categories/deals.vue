<template>
  <div>
    <v-card elevation="0" style="min-height: 100vh !important;">
      <v-layout>
        <v-main>
          <v-tabs center-active v-model="tab" bg-color="transparent">
            <div v-for="(menu, index) in dealbarMenus" :key="index">
              <v-tab :value="menu?.value">{{ menu?.name }}</v-tab>
            </div>
          </v-tabs>

          <v-card-text>
            <v-tabs-window v-model="tab">
              <v-tabs-window-item :value="dealbarMenus[0]?.value">
                <v-row>
                  <v-col cols="3" v-for="products in dealsProducts" :key="products">
                    <productCard :product="products" />
                  </v-col>
                </v-row>
              </v-tabs-window-item>

              <v-tabs-window-item :value="dealbarMenus[1]?.value">
                <v-row>
                  <v-col cols="3" v-for="products in dollar" :key="products">
                    <productCard :product="products" />
                  </v-col>
                </v-row>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-main>
      </v-layout>
    </v-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from '#imports'
import productCard from '#commerce/app/components/catalog/product/productCard.vue'
import { useProducts } from '#commerce/app/composables/catalog/products/useProducts/useProducts'

const { $directus, $readItem } = useNuxtApp()
const tab = ref(null)

const { data: dealbar } = await useAsyncData('dealbar', async () => {
  return $directus.request($readItem('navigation', '49', {
    fields: ['*', { '*': ['*'] }],
  }))
})
const dealbarMenus = computed(() => Array.isArray(dealbar.value?.menus) ? dealbar.value.menus : [])

const props = defineProps({
  category: {
    type: String,
    required: false,
    default: ''
  }
})

const { fetchProducts, data: productsData, loading } = useProducts()
const allProducts = ref([])
const dealsProducts = ref([])
const dollar = ref([])

async function loadProducts() {
  const resultRef = await fetchProducts()
  const all = (resultRef.value?.items || [])
  // Filter by category if provided
  const filtered = props.category
    ? all.filter(p => String(p.category_id || p.category || p.categoryId) === String(props.category))
    : all
  allProducts.value = filtered
  dealsProducts.value = filtered.filter(p => p.price && p.price <= 20)
  dollar.value = filtered.filter(p => p.price && Number(p.price) === 1)
}

onMounted(loadProducts)
watch(() => props.category, loadProducts)

useHead({
  title: 'Deals',
})
</script>