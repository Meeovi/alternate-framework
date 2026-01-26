<template>
    <div>
        <div v-if="department?.name === 'Deals'">
            <v-toolbar :style="`background-color: ${department?.color}; color: ${department?.colortext}`"
                :title="department?.name"></v-toolbar>
            <deals :category="department?.id" />
        </div>

        <div v-else>
            <v-card variant="text">
                <v-toolbar :style="`background-color: ${department?.color}; color: ${department?.colortext}`"
                    :title="department?.name">
                    <v-slide-group show-arrows v-if="department?.categories?.length">
                        <v-slide-group-item v-slot="{ isSelected, toggle }">
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn :color="isSelected ? 'primary' : undefined" class="ma-2" @click="toggle"
                                        v-bind="props" append-icon="fas:fa fa-caret-down" variant="text">
                                        Categories
                                    </v-btn>
                                </template>
                                <v-list class="departmentMenu">
                                    <v-row>
                                        <v-col cols="3" v-for="categories in department?.categories"
                                            :key="categories?.id">
                                            <v-list-item>
                                                <v-chip><NuxtLink
                                                    :to="`/departments/category/${categories?.categories_id?.slug}`">
                                                    {{ categories?.categories_id?.name }}</NuxtLink></v-chip>
                                            </v-list-item>
                                        </v-col>
                                    </v-row>
                                </v-list>
                            </v-menu>
                        </v-slide-group-item>

                        <v-slide-group-item v-if="department?.menus?.length" v-for="menu in department?.menus"
                            :key="menu" v-slot="{ isSelected, toggle }">
                            <v-btn :color="isSelected ? 'primary' : undefined" class="ma-2" @click="toggle"
                                :href="`${menu?.url}`">
                                {{ menu?.name }}
                            </v-btn>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-toolbar>

                <!--Department Top Banner Section-->
                <section data-bs-version="5.1" class="pricing6 shopm5 cid-tZY31Y2JxZ" id="apricing6-6g">

                    <div class="mbr-overlay"></div>
                    <div class="container-fluid">
                        <div class="row align-items-stretch items-row justify-content-center">

                            <div class="col-lg-6">
                                <div v-if="department?.name === 'Travel'">
                                    <travel :category="department?.name" />
                                </div>
                                <!--<div v-else-if="department?.name === 'Appstore'">
            <appstore :category="department?.name" />
          </div>-->
                                <div v-else-if="department?.name === 'Weather'">
                                    <weather :category="department?.name" />
                                </div>

                                <div v-else-if="department?.name === 'Time'">
                                    <timeComponent :category="department?.name" />
                                </div>

                                <div v-else class="mbr-section-head" :style="`background-color: ${department?.color}`">
                                    <h4 class="mbr-section-title mbr-fonts-style mb-0 display-7"
                                        :style="`color: ${department?.colortext}`">
                                        <strong>Meeovi</strong>
                                    </h4>
                                    <h5 class="mbr-section-subtitle mbr-fonts-style mb-0 display-2"
                                        :style="`color: ${department?.colortext}`">
                                        <strong>{{ department?.name }}</strong>
                                    </h5>
                                    <h5 class="main-text mbr-fonts-style mb-0 display-7"
                                        :style="`color: ${department?.colortext}`">
                                        {{ department?.description }}
                                    </h5>
                                </div>
                            </div>

                            <v-sheet
                                class="mx-auto col-lg-6" style="background-color: transparent; box-shadow: none;">
                                <h4 style="left: 15px; position: relative;">{{ callouts?.menus?.[1]?.name }}</h4>
                                <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                                    <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                        v-for="products in department?.products" :key="products">
                                        <productCard :product="products?.products_id" :class="['ma-4', selectedClass]"
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

                <!--Department Content Section-->
                <section data-bs-version="5.1" class="gallery2 shopm5 cid-uW1BojE78S" id="agallery2-0" v-if="department?.shorts?.length && department?.products?.products_id?.type === 'department'"
                    :style="`background-image: url(${$directus?.url}assets/${department?.image?.filename_disk})`">
                    <div class="mbr-overlay" style="opacity: 0.8; background-color: rgb(255, 255, 255);">
                    </div>

                    <div class="container-fluid">
                        <div class="row">
                            <!--Vibez Slider-->
                            <v-sheet
                                class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
                                <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                                    <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                        v-for="shorts in department?.shorts" :key="shorts">
                                        <shorts :short="shorts?.shorts_id" :class="['ma-4', selectedClass]"
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

                <v-row class="departmentRow">
                    <!--Best Seller Product Slider-->
                    <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
                        <h4 style="left: 15px; position: relative;">{{ callouts?.menus?.[1]?.name }}</h4>
                        <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                v-for="products in best?.products" :key="products">
                                <productCard :product="products?.products_id" :class="['ma-4', selectedClass]"
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

                    <!--List of latest products in the department-->
                    <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
                        <h4 style="left: 15px; position: relative;">{{ callouts?.menus?.[2]?.name }}</h4>
                        <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                v-for="products in latestProducts?.products" :key="products">
                                <productCard :product="products?.products_id" :class="['ma-4', selectedClass]"
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

                    <!--List of products in the department-->
                    <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
                        <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                v-for="products in department?.products" :key="products">
                                <productCard :product="products?.products_id" :class="['ma-4', selectedClass]"
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

                    <!--List of events in this department-->
                    <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center"
                        v-if="department?.products?.products_id?.type === 'department' && events?.length">
                        <h4 style="left: 15px; position: relative;">{{ callouts?.menus?.[3]?.name }}
                            {{ department?.name }}</h4>
                        <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                v-for="products in events" :key="products">
                                <productCard :product="products?.events_id" :class="['ma-4', selectedClass]"
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
                    <!---->

                    <!--List of spaces in the department-->
                    <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center"
                        v-if="department?.spaces?.length">
                        <h4 style="left: 15px; position: relative;">{{ callouts?.menus?.[4]?.name }}
                            {{ department?.name }}</h4>
                        <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                v-for="spaces in department?.spaces" :key="spaces">
                                <spaces :space="spaces?.spaces_id" :class="['ma-4', selectedClass]" @click="toggle" />
                                <div class="d-flex fill-height align-center justify-center">
                                    <v-scale-transition>
                                        <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline"
                                            size="48"></v-icon>
                                    </v-scale-transition>
                                </div>
                            </v-slide-group-item>
                        </v-slide-group>
                    </v-sheet>
                </v-row>
            </v-card>
        </div>
    </div>
</template>

<script setup>
    import shorts from '#social/app/components/related/short.vue'
    import spaces from '#social/app/components/related/space.vue'
    import productCard from '#commerce/app/components/catalog/product/productCard.vue'
    import travel from '@/components/categories/travel.vue'
    import deals from '@/components/categories/deals.vue'
    import timeComponent from '@/components/categories/time/time.vue'
    import weather from '@/components/categories/weather/weather.vue'

    const route = useRoute()
    const model = ref(null)
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
        data: departmentRaw
    } = await useAsyncData('department', () => {
        return $directus.request(
            $readItems('departments', {
                fields: [
                    '*',
                    'categories.categories_id.*',
                    'spaces.spaces_id.*',
                    'products.products_id.*',
                    'products.products_id.image.*',
                    'shorts.shorts_id.*',
                    'shops.shops_id.*',
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

    const department = computed(() => departmentRaw.value?.[0] || null)

    const {
        data: introProducts
    } = await useAsyncData('introProducts', () => {
        return $directus.request($readItems('departments', {
            fields: ['*', { '*': ['*'] }],
            limit: 2,
        }))
    })

    const {
        data: best
    } = await useAsyncData('best', () => {
        return $directus.request($readItems('departments', {
            fields: ['*',
                'products.products_id.*',
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
                },
            }
        }))
    })

    const {
        data: latestProducts
    } = await useAsyncData('latestProducts', () => {
        return $directus.request($readItems('departments', {
            fields: ['*',
                'products.products_id.*',
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
                },
            }
        }))
    })

    const {
        data: limitProducts
    } = await useAsyncData('limitProducts', () => {
        return $directus.request($readItems('departments', {
            fields: ['*',
                'products.products_id.*',
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
                },
            }
        }))
    })

    const {
        data: events
    } = await useAsyncData('events', () => {
        return $directus.request($readItems('departments', {
            fields: ['*',
                'products.products_id.*',
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
                },
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