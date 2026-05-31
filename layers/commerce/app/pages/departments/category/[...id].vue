<template>
  <div v-if="category">
    <v-card variant="text">
      <v-toolbar :style="`background-color: ${category?.color}; color: ${category?.colortext}`">
        <v-toolbar-title>
          <NuxtLink :to="`/departments/${category?.departments?.[0]?.departments_id?.name}`">
            Meeovi {{ category?.departments?.[0]?.departments_id?.name }}
          </NuxtLink>
          - {{ category?.name }}
        </v-toolbar-title>
        <v-slide-group v-if="category?.categories?.length" show-arrows>
          <v-slide-group-item v-slot="{ isSelected }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn :color="isSelected ? 'primary' : undefined" class="ma-2" v-bind="props" variant="text">
                  Categories
                </v-btn>
              </template>

              <v-list class="departmentMenu">
                <v-row>
                  <v-col v-for="sub in category.categories" :key="sub?.categories_id?.id" cols="3">
                    <v-list-item>
                      <NuxtLink :to="`/departments/categories/${sub.categories_id.id}`">
                        {{ sub.categories_id.name }}
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

    <v-row>
      <v-col v-for="productRel in category.products" :key="productRel.products_id.id" cols="3">
        <ProductCard :product="productRel.products_id" />
      </v-col>
    </v-row>
  </div>

  <div v-else class="p-10 text-center text-xl text-neutral-700">
    Loading category...
  </div>
</template>

<script setup lang="ts">
import ProductCard from '../../../components/catalog/product/productCard.vue'
import { useAppGateway } from '../../../composables/useAppGateway'
import { ref, watch, computed } from 'vue'

const route = useRoute()
const gateway = useAppGateway()
const category = ref(null)
const products = ref([])

async function loadCategory() {
  try {
    // Use id if available, fallback to slug
    const filter = route.params.id
      ? { id: { _eq: Array.isArray(route.params.id) ? route.params.id[0] : route.params.id } }
      : { slug: { _eq: Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug } }
    const resp = await gateway.content.readItems('categories', {
      fields: ['*', 'tags.tags_id.*', 'departments.departments_id.*', 'products.products_id.*', 'products.products_id.image.*', 'menus.*', 'image.*'],
      filter,
      limit: 1,
    })
    category.value = Array.isArray(resp?.data) ? resp.data[0] : (resp?.data || resp || [])[0] || null
  } catch (e) {
    category.value = null
  }
}

async function loadProducts() {
  if (!category.value?.magento_category_id) {
    products.value = []
    return
  }
  try {
    products.value = await gateway.commerce.products.listByCategory({
      categoryId: category.value.magento_category_id
    })
  } catch (e) {
    products.value = []
  }
}

await loadCategory()
await loadProducts()

watch(() => route.params.slug, async () => {
  await loadCategory()
  await loadProducts()
})

useHead({
  title: computed(() => category.value?.name || 'Category Page'),
})
</script>
