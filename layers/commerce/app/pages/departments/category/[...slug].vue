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
import { useCommerceAdapter, useContentAdapter } from '#imports'
import ProductCard from '#commerce/app/components/catalog/product/productCard.vue'
import useDirectusRequest from '~/composables/useDirectusRequest'

void useCommerceAdapter()
void useContentAdapter()

const route = useRoute()
const { readItems } = useDirectusRequest()

const slug = computed(() => {
  const s = route.params.slug
  return Array.isArray(s) ? s[0] : s
})

const { data: categoryRaw } = await useAsyncData('categoryRaw', async () => {
  const resp = await readItems('categories', {
    fields: ['*', 'tags.tags_id.*', 'departments.departments_id.*', 'products.products_id.*', 'products.products_id.image.*', 'menus.*', 'image.*'],
    filter: { slug: { _eq: slug.value } },
    limit: 1,
  })
  return resp?.data || resp || []
})

const category = computed(() => categoryRaw.value?.[0] || null)

useHead({
  title: computed(() => category.value?.name || 'Category Page'),
})
</script>
