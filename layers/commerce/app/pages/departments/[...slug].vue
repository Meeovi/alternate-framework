<template>
    <div class="departmentPage">
        <div v-if="department?.slug === 'deals'">
            <v-toolbar :style="`background-color: ${department?.color}; color: ${department?.colortext}`"
                :title="department?.name" />
            <deals :category="department?.slug" />
        </div>
        <div v-if="department?.slug === 'events'">
            <v-toolbar :style="`background-color: ${department?.color}; color: ${department?.colortext}`"
                :title="department?.name" />
            <events :category="department?.slug" />
        </div>
        
        <div v-else>
            <v-card variant="text">
                <v-toolbar :style="`background-color: ${department?.color}; color: ${department?.colortext}`"
                    :title="department?.name">
                        <v-menu v-if="department?.categories?.length">
                            <template v-slot:activator="{ props }">
                                <v-btn class="deptCatBtn ma-2" v-bind="props" append-icon="fas:fa fa-caret-down"
                                    variant="text">
                                    Categories
                                </v-btn>
                            </template>
                            <v-list class="departmentMenu">
                                <v-row>
                                    <v-col cols="3" v-for="categories in department?.categories"
                                        :key="categories?.categories_id?.id">
                                        <v-list-item>
                                            <v-chip>
                                                <NuxtLink
                                                    :to="`/departments/category/${categories?.categories_id?.id}`">
                                                    {{ categories?.categories_id?.name }}
                                                </NuxtLink>
                                            </v-chip>
                                        </v-list-item>
                                    </v-col>
                                </v-row>
                            </v-list>
                        </v-menu>

                        <v-slide-group>
                            <v-slide-group-item v-if="department?.menus?.length" v-for="menu in department?.menus"
                                :key="menu" v-slot="{ isSelected, toggle }">
                                <v-chip :color="`${department?.colortext}`" class="ma-2" @click="toggle"
                                    :href="`${menu?.url}`">
                                    {{ menu?.name }}
                                </v-chip>
                            </v-slide-group-item>
                        </v-slide-group>
                </v-toolbar>
                <!-- Category Top Banner Section -->
                <section data-bs-version="5.1" class="pricing6 shopm5 cid-tZY31Y2JxZ" id="apricing6-6g">
                    <div class="mbr-overlay"></div>
                    <div class="container-fluid">
                        <weather v-if="department?.slug === 'weather' "/>

                        <travel v-if="department?.slug === 'travel' "/>

                        <timeComponent v-if="department?.slug === 'time' "/>

                        <adultstore v-if="department?.slug === 'adult' "/>

                        <pantry v-if="department?.slug === 'pantry' "/>

                        <pay v-if="department?.slug === 'pay' "/>

                        <finance v-if="department?.slug === 'finance' "/>

                        <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center" v-if="department?.shorts?.length">
                            <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                    v-for="shorts in department?.shorts" :key="shorts">
                                    <shortsCard :short="shorts?.shorts_id" :class="['ma-4', selectedClass]"
                                        @click="toggle" />
                                    <div class="d-flex fill-height align-center justify-center">
                                        <v-scale-transition>
                                            <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark"
                                                size="48"></v-icon>
                                        </v-scale-transition>
                                    </div>
                                </v-slide-group-item>
                            </v-slide-group>
                        </v-sheet>
                    </div>
                </section>

                <!-- Latest Products Section (commerce) -->
                <v-sheet style="background-color: transparent; box-shadow: none;">
                    <v-toolbar title="Products" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in latestProducts"
                            :key="product.id">
                            <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark"
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
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in best"
                            :key="product.id">
                            <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark"
                                        size="48"></v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>

                <!-- Posts about this Category Section (content) -->
                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="department?.posts?.length">
                    <v-toolbar title="Posts" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="post in department?.posts"
                            :key="post.id">
                            <postCard :post="post" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark"
                                        size="48"></v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>

                <!-- Event Type Products Section (commerce) -->
                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="events?.length">
                    <v-toolbar title="Events" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                            v-for="product in events" :key="product.id">
                            <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark"
                                        size="48"></v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>

                <!-- Category Products Section (commerce) -->
                <v-row style="padding: 10px;" v-if="department?.products?.length">
                    <v-col cols="3" v-for="product in department?.products" :key="product?.products_id?.id ?? product.id">
                        <productCard :product="product?.products_id" />
                    </v-col>
                </v-row>

                <!-- Spaces about this Category Section (content) -->
                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="department?.spaces?.length">
                    <v-toolbar title="Spaces" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                            v-for="space in department?.spaces" :key="space.id">
                            <spaceCard :space="space" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark"
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
    import deals from '#commerce/app/components/catalog/categories/deals.vue'
    import timeComponent from '#commerce/app/components/catalog/categories/time/time.vue'
    import weather from '#commerce/app/components/catalog/categories/weather/weather.vue'
    import pay from '#commerce/app/components/catalog/categories/pay/pay.vue'
    import adultstore from '#commerce/app/components/catalog/categories/adultstore.vue'
    import pantry from '#commerce/app/components/catalog/categories/pantry/pantry.vue'
    import finance from '#commerce/app/components/catalog/categories/finance.vue'
    import spaceCard from '#social/app/components/related/space.vue'
    import postCard from '#social/app/components/related/post.vue'
    import shortsCard from '#social/app/components/related/short.vue' 

    import {
        ref,
        computed
    } from '#imports'
    import { CommerceBackendRegistry } from 'alternate-sdk'

    const route = useRoute()
    const model = ref(null)
    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()

    // [...slug].vue is a catch-all route, so route.params.slug is an array
    // of segments — every query below filters by slug rather than passing
    // the raw array as a Directus primary key.
    const departmentSlug = computed(() =>
        Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
    )

    const {
        data: department
    } = await useAsyncData('department', async () => {
        const result = await $directus.request($readItems('departments', {
            fields: ['*',
                'categories.categories_id.*',
                'spaces.spaces_id.*',
                'products.products_id.*',
                'products.products_id.image.*',
                'posts.posts_id.*',
                'menus.*',
                'shorts.shorts_id.*',
                'image.*'
            ],
            filter: {
                slug: {
                    _eq: departmentSlug.value
                }
            },
            limit: 1
        }))
        return Array.isArray(result) ? result[0] : null
    })

    // Cross-references this department's product sections with whichever
    // commerce backend is active. departments/categories themselves always
    // stay Directus-sourced (see IN_SCOPE_COLLECTIONS in
    // app/plugins/directus.ts) — only the PRODUCTS shown on this page get
    // swapped, via the adapter's own optional getProductsByCategory, keyed
    // on this department's slug (falling back to its externalId —
    // departments.relative_id — when populated).
    const activeCommerceBackend = useRuntimeConfig().public.commerceBackend || 'directus'
    const usingBackendCatalog = computed(() => activeCommerceBackend !== 'directus')

    const {
        data: backendCategoryProducts
    } = await useAsyncData('department-backend-products', async () => {
        if (!usingBackendCatalog.value || !department.value) return null
        const adapter = CommerceBackendRegistry.get(activeCommerceBackend)
        if (!adapter?.isEnabled?.() || typeof adapter.getProductsByCategory !== 'function') return null
        return adapter.getProductsByCategory({
            slug: department.value.slug,
            externalId: department.value.relative_id || undefined,
        })
    })

    if (backendCategoryProducts.value) {
        department.value.products = backendCategoryProducts.value.map((product) => ({ products_id: product }))
    }

    // These department-scoped queries filter the `departments` collection
    // itself (to match slug + the relevant products/showcases condition)
    // but the template renders a flat list of products, so the nested
    // products.products_id relation is extracted out here.
    const extractProducts = (departments) =>
        (Array.isArray(departments) ? departments : [])
            .flatMap((dept) => dept?.products || [])
            .map((p) => p?.products_id)
            .filter(Boolean)

    // "Best Sellers" and "latest" are Directus merchandising concepts
    // (a showcase tag, a status flag) with no equivalent ranking/filter in
    // most backends' product APIs — rather than fabricate a fake "best
    // sellers" sort a backend doesn't actually support, both honestly
    // degrade to the same set already fetched above for the main grid
    // (backendCategoryProducts), sliced to match this section's own limit.
    const {
        data: best
    } = await useAsyncData('best', async () => {
        if (usingBackendCatalog.value) return (backendCategoryProducts.value ?? []).slice(0, 10)
        const result = await $directus.request($readItems('departments', {
            fields: ['*',
                'products.products_id.*',
                'showcases.showcases_id.*',
                'images.*'
            ],
            limit: 10,
            filter: {
                slug: { _eq: departmentSlug.value },
                showcases: {
                    showcases_id: {
                        name: {
                            _eq: "Best Sellers"
                        }
                    }
                }
            }
        }))
        return extractProducts(result)
    })

    const {
        data: latestProducts
    } = await useAsyncData('latestProducts', async () => {
        if (usingBackendCatalog.value) return (backendCategoryProducts.value ?? []).slice(0, 10)
        const result = await $directus.request($readItems('departments', {
            fields: ['*',
                'products.products_id.*',
                'showcases.showcases_id.*',
                'images.*'
            ],
            limit: 10,
            filter: {
                slug: { _eq: departmentSlug.value },
                products: {
                    products_id: {
                        status: {
                            _eq: "published"
                        }
                    }
                }
            }
        }))
        return extractProducts(result)
    })

    // "Event"-type products are a Directus product_types attribute filter —
    // an axis unrelated to category/department membership, so there's no
    // honest way to approximate it from getProductsByCategory's result
    // (unlike best/latest above, showing category products here would be
    // actively misleading, not just an approximation). Degrades to empty
    // — the template already guards this section with `v-if="events?.length"`,
    // so it simply doesn't render rather than showing wrong data.
    const {
        data: events
    } = await useAsyncData('events', async () => {
        if (usingBackendCatalog.value) return []
        const result = await $directus.request($readItems('departments', {
            fields: ['*',
                'products.products_id.*',
                'showcases.showcases_id.*',
                'images.*'
            ],
            limit: 10,
            filter: {
                slug: { _eq: departmentSlug.value },
                products: {
                    products_id: {
                        product_types: {
                            product_types_id: {
                                name: {
                                    _eq: "Event"
                                }
                            }
                        }
                    }
                }
            }
        }))
        return extractProducts(result)
    })

    const {
        data: callouts
    } = await useAsyncData('callouts', () => {
        return $directus.request($readItem('callouts', '2'))
    })

    useHead({
        title: computed(() => department?.value?.name || 'Department Page')
    });
</script>