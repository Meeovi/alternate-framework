<template>
    <div v-if="category">

        <!-- Special Categories -->
        <div v-if="category.slug === 'charts'">
            <charts />
        </div>

        <div v-else-if="category.slug === 'radio-stations'">
            <stations />
        </div>

        <div v-else-if="category.slug === 'eats'">
            <eats />
        </div>

        <div v-else-if="category.slug === 'restaurants'">
            <div v-for="(shop, i) in restaurantsList" :key="i">
                <restaurants :restaurant="shop" />
            </div>
        </div>

        <!-- Default Category Layout -->
        <v-card variant="text" v-else>
            <v-toolbar :style="`background-color: ${category?.color}; color: ${category?.colortext}`">
                <v-toolbar-title><NuxtLink :to="`/departments/${category?.departments?.[0]?.departments_id?.name}`">Meeovi {{ category?.departments?.[0]?.departments_id?.name }}</NuxtLink> - {{ category?.name }}</v-toolbar-title>
                <v-slide-group show-arrows v-if="category?.categories?.length">
                    <v-slide-group-item v-slot="{ isSelected, toggle }">
                        <v-menu>
                            <template #activator="{ props }">
                                <v-btn :color="isSelected ? 'primary' : undefined" class="ma-2" v-bind="props"
                                    variant="text">
                                    Categories
                                </v-btn>
                            </template>

                            <v-list class="departmentMenu">
                                <v-row>
                                    <v-col cols="3" v-for="sub in category.categories" :key="sub?.categories_id?.id">
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

                    <v-slide-group-item v-for="menu in category.menus" :key="menu.id" v-slot="{ isSelected, toggle }">
                        <v-btn :color="isSelected ? 'primary' : undefined" class="ma-2" :href="menu.url">
                            {{ menu.name }}
                        </v-btn>
                    </v-slide-group-item>
                </v-slide-group>
            </v-toolbar>
        </v-card>

        <!-- Product List -->
        <v-row>
            <v-col cols="3" v-for="productRel in category.products" :key="productRel.products_id.id">
                <productCard :product="productRel.products_id" />
            </v-col>
        </v-row>

    </div>

    <!-- Loading / Not Found -->
    <div v-else class="p-10 text-center text-xl text-neutral-700">
        Loading category...
    </div>
</template>

<script setup>
    import charts from '~/components/categories/charts.vue'
    import stations from '~/components/categories/stations.vue'
    import eats from '~/components/categories/eats.vue'
    import restaurants from '~/components/categories/restaurants.vue'
    import productCard from '#commerce/app/components/catalog/product/productCard.vue'

    const route = useRoute()
    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()

    const slug = computed(() => {
        const s = route.params.slug
        return Array.isArray(s) ? s[0] : s
    })

    const {
        data: categoryRaw
    } = await useAsyncData('categoryRaw', () => {
        return $directus.request(
            $readItems('categories', {
                fields: [
                    '*',
                    'tags.tags_id.*',
                    'departments.departments_id.*',
                    'products.products_id.*',
                    'products.products_id.image.*',
                    'menus.*',
                    'image.*'
                ],
                filter: {
                    slug: {
                        _eq: slug.value
                    }
                },
                limit: 1
            })
        )
    })

    // Unwrap array cleanly
    const category = computed(() => categoryRaw.value?.[0] || null)


    // FETCH SHOPS FOR RESTAURANTS CATEGORY
    const {
        data: restaurantsList
    } = await useAsyncData('restaurantsList', () => {
        return $directus.request($readItems('shops', {
            fields: ['*']
        }))
    })

    // SEO
    useHead({
        title: computed(() => category.value?.name || 'Category Page')
    })
</script>