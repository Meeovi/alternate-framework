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
                                <v-chip :color="isSelected ? 'primary' : undefined" class="ma-2" @click="toggle"
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
                        <weather v-if="department?.slug === 'Weather' "/>

                        <travel v-if="department?.slug === 'Travel' "/>

                        <timeComponent v-if="department?.slug === 'Time' "/>

                        <restaurants v-if="department?.slug === 'Restaurants' "/>

                        <adultstore v-if="department?.slug === 'Adult' "/>

                        <pantry v-if="department?.slug === 'Pantry' "/>

                        <pay v-if="department?.slug === 'Pay' "/>

                        <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center" v-if="department?.shorts?.length">
                            <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                    v-for="shorts in department?.shorts" :key="shorts">
                                    <shortsCard :short="shorts?.shorts_id" :class="['ma-4', selectedClass]"
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
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in best"
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

                <!-- Posts about this Category Section (content) -->
                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="department?.posts?.length">
                    <v-toolbar title="Posts" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="post in department?.posts"
                            :key="post.id">
                            <postCard :post="post" :class="['ma-4', selectedClass]" @click="toggle" />
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
                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="events?.length">
                    <v-toolbar title="Events" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                            v-for="product in events" :key="product.id">
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
                <v-row style="padding: 10px;" v-if="department?.products?.length">
                    <v-col cols="3" v-for="product in department?.products" :key="product.id">
                        <productCard :product="product" />
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
    import deals from '#commerce/app/components/catalog/categories/deals.vue'
    import timeComponent from '#commerce/app/components/catalog/categories/time/time.vue'
    import weather from '#commerce/app/components/catalog/categories/weather/weather.vue'
    import restaurants from '#commerce/app/components/catalog/categories/restaurants.vue'
    import pay from '#commerce/app/components/catalog/categories/pay/pay.vue'
    import adultstore from '#commerce/app/components/catalog/categories/adultstore.vue'
    import pantry from '#commerce/app/components/catalog/categories/pantry/pantry.vue'
    import spaceCard from '#social/app/components/related/space.vue'
    import postCard from '#social/app/components/related/post.vue'
    import shortsCard from '#social/app/components/related/short.vue' 

    import {
        ref,
        computed
    } from '#imports'

    const route = useRoute()
    const model = ref(null)
    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()

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
                    _eq: `${route.params.slug}`
                }
            },
            limit: 1
        }))
        return Array.isArray(result) ? result[0] : null
    })

    const {
        data: introProducts
    } = await useAsyncData('introProducts', () => {
        return $directus.request($readItem('departments', route.params.slug, {
            fields: ['*',
                'products.products_id.*',
                'showcases.showcases_id.*',
                'images.*'
            ],
            limit: 2,
        }))
    })

    const {
        data: best
    } = await useAsyncData('best', () => {
        return $directus.request($readItem('departments', route.params.slug, {
            fields: ['*',
                'products.products_id.*',
                'showcases.showcases_id.*',
                'images.*'
            ],
            limit: 10,
            filter: {
                showcases: {
                    showcases_id: {
                        name: {
                            _eq: "Best Sellers"
                        }
                    }
                }
            }
        }))
    })

    const {
        data: latestProducts
    } = await useAsyncData('latestProducts', () => {
        return $directus.request($readItem('departments', route.params.slug, {
            fields: ['*',
                'products.products_id.*',
                'showcases.showcases_id.*',
                'images.*'
            ],
            limit: 10,
            filter: {
                products: {
                    products_id: {
                        status: {
                            _eq: "published"
                        }
                    }
                }
            }
        }))
    })

    const {
        data: limitProducts
    } = await useAsyncData('limitProducts', () => {
        return $directus.request($readItem('departments', route.params.slug, {
            fields: ['*',
                'products.products_id.*',
                'showcases.showcases_id.*',
                'images.*'
            ],
            limit: 2,
            filter: {
                products: {
                    products_id: {
                        status: {
                            _eq: "published"
                        }
                    }
                }
            }
        }))
    })

    const {
        data: events
    } = await useAsyncData('events', () => {
        return $directus.request($readItem('departments', route.params.slug, {
            fields: ['*',
                'products.products_id.*',
                'showcases.showcases_id.*',
                'images.*'
            ],
            limit: 10,
            filter: {
                products: {
                    products_id: {
                        type: {
                            _eq: "event"
                        }
                    }
                }
            }
        }))
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