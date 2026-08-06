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
  import {
    useAppGateway
  } from '#shared/app/composables/useAppGateway'
  import {
    useRoute,
    useNuxtApp,
    useHead
  } from '#app'
  import Restaurants from '../../../components/catalog/categories/restaurants.vue'

  const route = useRoute()
  const gateway = useAppGateway()
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
  } = await useAsyncData(categoryKey, async () => {
    try {
      const filter = route.params.id ? {
        id: {
          _eq: Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
        }
      } : {
        slug: {
          _eq: routeslug.value
        }
      }
      const resp = await $directus.request($readItems('categories', {
        fields: ['*', 'tags.tags_id.*', 'departments.departments_id.*', 'products.products_id.*',
          'products.products_id.image.*', 'menus.*', 'image.*'
        ],
        filter,
        limit: 1,
      }))
      return Array.isArray(resp?.data) ? resp.data[0] : (resp?.data || resp || [])[0] || null
    } catch {
      return null
    }
  })

  const category = computed(() => categoryRaw.value)

  useHead({
    title: computed(() => category.value?.name || 'Category Page'),
  })
</script>