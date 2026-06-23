<template>
    <div>
        <div v-if="category?.name === 'Deals'">
            <v-toolbar :style="`background-color: ${category?.color}; color: ${category?.colortext}`"
                :title="category?.name" />
            <deals :category="category?.id" />
        </div>
        <div v-else>
            <v-card variant="text">
                <v-toolbar :style="`background-color: ${category?.color}; color: ${category?.colortext}`"
                    :title="category?.name">
                    <template #extension>
                        <v-menu v-if="normalizedCategories.length">
                            <template v-slot:activator="{ props }">
                                <v-btn class="deptCatBtn ma-2" v-bind="props" append-icon="fas:fa fa-caret-down"
                                    variant="text">
                                    Categories
                                </v-btn>
                            </template>
                            <v-list class="departmentMenu">
                                <v-row>
                                    <v-col cols="3" v-for="cat in normalizedCategories" :key="cat.id">
                                        <v-list-item>
                                            <v-chip>
                                                <NuxtLink :to="`/departments/category/${cat.id}`">
                                                    {{ cat.name }}
                                                </NuxtLink>
                                            </v-chip>
                                        </v-list-item>
                                    </v-col>
                                </v-row>
                            </v-list>
                        </v-menu>

                        <v-btn
                            v-for="menu in normalizedMenus"
                            :key="menu.id || menu.name || menu.url"
                            class="ma-2"
                            :href="`${menu?.url}`"
                            variant="text"
                        >
                            {{ menu?.name }}
                        </v-btn>
                    </template>
                </v-toolbar>
                <!-- Category Top Banner Section -->
                <section data-bs-version="5.1" class="pricing6 shopm5 cid-tZY31Y2JxZ" id="apricing6-6g">
                    <div class="mbr-overlay"></div>
                    <div class="container-fluid">
                        <div class="row align-items-stretch items-row justify-content-center">
                            <div class="col-lg-6">
                                <div v-if="category?.name === 'Travel'">
                                    <travel :category="category?.name" />
                                </div>
                                <div v-else-if="category?.name === 'Weather'">
                                    <weather :category="category?.name" />
                                </div>
                                <div v-else-if="category?.name === 'Time'">
                                    <timeComponent :category="category?.name" />
                                </div>
                                <div v-else class="mbr-section-head" :style="`background-color: ${category?.color}`">
                                    <h4 class="mbr-section-title mbr-fonts-style mb-0 display-7"
                                        :style="`color: ${category?.colortext}`">
                                        <strong>Meeovi</strong>
                                    </h4>
                                    <h5 class="mbr-section-subtitle mbr-fonts-style mb-0 display-2"
                                        :style="`color: ${category?.colortext}`">
                                        <strong>{{ category?.name }}</strong>
                                    </h5>
                                    <h5 class="main-text mbr-fonts-style mb-0 display-7"
                                        :style="`color: ${category?.colortext}`">
                                        {{ category?.description }}
                                    </h5>
                                </div>
                            </div>
                            <v-sheet class="mx-auto col-lg-6" style="background-color: transparent; box-shadow: none;">
                                <h4>Products</h4>
                                <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                                    <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                        v-for="product in products" :key="product.id">
                                        <productCard :product="product" :class="['ma-4', selectedClass]"
                                            @click="toggle" />
                                        <div class="d-flex fill-height align-center justify-center">
                                            <v-scale-transition>
                                                <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline"
                                                    size="48"></v-icon>
                                            </v-scale-transition>
                                        </div>
                                    </v-slide-group-item>
                                </v-slide-group>
                            </v-sheet>
                        </div>
                    </div>
                </section>

                <!-- Latest Products Section (commerce) -->
                <v-sheet style="background-color: transparent; box-shadow: none;">
                    <v-toolbar title="Products" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in products"
                            :key="product.id">
                            <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline"
                                        size="48"></v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>

                <!-- Best Selling Products Section (commerce) -->
                <v-sheet style="background-color: transparent; box-shadow: none;">
                    <v-toolbar title="Best Sellers" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                            v-for="product in bestSellingProducts" :key="product.id">
                            <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline"
                                        size="48"></v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>

                <!-- Posts about this Category Section (content) -->
                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="posts?.length">
                    <v-toolbar title="Posts" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="post in posts"
                            :key="post.id">
                            <post :post="post" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline"
                                        size="48"></v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>

                <!-- Event Type Products Section (commerce) -->
                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="eventProducts?.length">
                    <v-toolbar title="Events" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                            v-for="product in eventProducts" :key="product.id">
                            <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline"
                                        size="48"></v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>

                <!-- Category Products Section (commerce) -->
                <v-row style="padding: 10px;" v-if="products?.length">
                    <v-col cols="3" v-for="product in products" :key="product.id">
                        <productCard :product="product" />
                    </v-col>
                </v-row>

                <!-- Spaces about this Category Section (content) -->
                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="departmentSpaces?.length">
                    <v-toolbar title="Spaces" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                            v-for="space in departmentSpaces" :key="space.id">
                            <space :space="space" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline"
                                        size="48"></v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>
            </v-card>
        </div>
    </div>
</template>

<script setup>
    import productCard from '../../components/catalog/product/productCard.vue'
    import travel from '#commerce/app/components/catalog/categories/travel.vue'
    import space from '#social/app/components/related/space.vue'
    import post from '#social/app/components/related/post.vue'
    import shorts from '#social/app/components/related/short.vue'
    import deals from '#commerce/app/components/catalog/categories/deals.vue'
    import timeComponent from '#commerce/app/components/catalog/categories/time/time.vue'
    import weather from '#commerce/app/components/catalog/categories/weather/weather.vue'
    import {
        useAppGateway
    } from '../../composables/useAppGateway'
    import {
        useProducts
    } from '#commerce/app/composables/catalog/products/useProducts/useProducts'
    import {
        ref,
        watch,
        computed
    } from '#imports'

    const route = useRoute()
    const gateway = useAppGateway()
    const { $sdk } = useNuxtApp()
    const category = ref(null)

    function toList(input) {
        if (Array.isArray(input)) return input
        return []
    }

    const slug = computed(() => {
        const raw = route.params.slug
        return Array.isArray(raw) ? raw[0] : raw
    })

    const products = ref([])
    const bestSellingProducts = ref([])
    const eventProducts = ref([])
    const {
        fetchProducts,
        data: productsData,
        loading
    } = useProducts()
    const posts = ref([])
    const departmentSpaces = ref([])

    async function loadCategory() {
        const resp = await $sdk.content.readItems('departments', {
            filter: {
                slug: { _eq: `${slug.value}` }
            },
            limit: 1,
            fields: [
                '*',
                'menus.*',
                'categories.categories_id.*'
            ]
        })

        category.value = toList(resp)[0] || null
    }

    async function loadProducts() {
        await fetchProducts()
        const all = (productsData.value?.items || [])
        const catId = category.value?.id || category.value?.category_id || category.value?.categoryId || category
            .value?.magento_category_id
        const filtered = catId ? all.filter(p => String(p.category_id || p.category || p.categoryId) === String(
            catId)) : all
        products.value = filtered
        bestSellingProducts.value = filtered.filter(p => p.bestSelling)
        eventProducts.value = filtered.filter(p => p.type === 'event')
    }

    async function loadPosts() {
        const resp = await $sdk.content.readItems('posts', {
            filter: {
                categories: {
                    _eq: category.value?.id
                }
            },
            limit: 10
        })
        posts.value = toList(resp)
    }

    async function loadSpaces() {
        const resp = await $sdk.content.readItems('spaces', {
            filter: {
                categories: {
                    _eq: category.value?.id
                }
            },
            limit: 10
        })
        departmentSpaces.value = toList(resp)
    }

    async function loadAll() {
        await loadCategory()
        await Promise.all([
            loadProducts(),
            loadPosts(),
            loadSpaces()
        ])
    }

    const normalizedCategories = computed(() => {
        if (!category.value?.categories) return []
        return category.value.categories
            .map(c => c.categories_id || c)
            .filter(Boolean)
    })

    const normalizedMenus = computed(() => {
        const menus = category.value?.menus
        if (!Array.isArray(menus)) return []
        return menus.filter(Boolean)
    })

    await loadAll()

    watch(() => route.params.slug, async () => {
        await loadAll()
    })

    useHead({
        title: computed(() => category.value?.name || 'Department Page')
    })
</script>