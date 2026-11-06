<template>
    <div class="departmentPage">
        <div v-if="department?.slug === 'deals'">
            <v-toolbar :style="`background-color: ${department?.color}; color: ${department?.colortext}`"
                :title="department?.name" />
            <deals :category="department?.slug" />
        </div>
        <div v-else-if="department?.slug === 'events'">
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
                                <v-col cols="3" v-for="group in categoryGroups" :key="group.category.id">
                                    <v-list-item>
                                        <v-chip>
                                            <NuxtLink :to="`/departments/category/${group.category.id}`">
                                                {{ group.category.name }}
                                            </NuxtLink>
                                        </v-chip>
                                    </v-list-item>
                                    <v-list-item v-for="sub in group.children" :key="sub.id" density="compact"
                                        class="ps-8">
                                        <NuxtLink :to="`/departments/category/${sub.id}`">{{ sub.name }}</NuxtLink>
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
                        <!-- Pixanomy: images and artwork (Art, Photography… are its categories). -->
                        <v-container v-if="department?.slug === 'pixanomy'" fluid class="py-4">
                            <MeeoviRelatedMedia title="Your media" type="image" :limit="20" :show-empty="false" />
                        </v-container>

                        <weather v-if="department?.slug === 'weather' " />

                        <travel v-if="department?.slug === 'travel' " />

                        <timeComponent v-if="department?.slug === 'time' " />

                        <adultstore v-if="department?.slug === 'adult' " />

                        <pantry v-if="department?.slug === 'pantry' " />

                        <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center"
                            v-if="department?.shorts?.length">
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
                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="latestProducts?.length">
                    <v-toolbar title="Products" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                            v-for="product in latestProducts" :key="product.id">
                            <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48">
                                    </v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>

                <!-- Elite Novels Stories Cards -->
                <v-sheet style="background-color: transparent; box-shadow: none;"
                    v-if="isEliteNovels && stories?.length">
                    <v-toolbar title="Stories from Elite Novels" color="transparent">

                        <v-toolbar-items>
                            <v-btn class="ma-2" variant="text" href="https://elitenovels.com/stories">
                                Read More Stories
                            </v-btn>
                        </v-toolbar-items>
                    </v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="story in stories"
                            :key="story.id">
                            <storyCard :story="story" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48">
                                    </v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>

                <!-- The rows from here down load when the visitor scrolls near them. -->
                <div ref="lowerSections" />

                <!-- Best Selling Products Section (commerce) -->
                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="best?.length">
                    <v-toolbar title="Best Sellers" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in best"
                            :key="product.id">
                            <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48">
                                    </v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>


                <!-- Event Type Products Section (commerce) -->
                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="events?.length">
                    <v-toolbar title="Events" color="transparent"></v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in events"
                            :key="product.id">
                            <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48">
                                    </v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>

                <!-- Exclusives: everything by Sebastian Hilton and Meeovi -->
                <exclusives v-if="department?.slug === 'exclusives'" page />

                <!-- Category Products Section (commerce): searchable, sortable, filterable -->
                <template v-else-if="gridProducts.length">
                    <SortFilterBar :controller="productControls" :count="shownProducts.length"
                        :total="gridProducts.length" noun="products" search-label="Search this department" />
                    <v-row v-if="shownProducts.length" style="padding: 10px;">
                        <v-col cols="12" sm="6" md="4" lg="3" v-for="product in shownProducts"
                            :key="product.id">
                            <productCard :product="product" />
                        </v-col>
                    </v-row>
                    <div v-else class="text-center text-medium-emphasis py-10">
                        No products match. <v-btn variant="text" @click="productControls.reset()">Clear filters</v-btn>
                    </div>
                </template>
                <!-- Nothing to sell here yet -->
                <EmptyCategory v-else kind="department" :department-id="department?.id" />

                <!-- Notes, public lists, events and spaces about this department -->
                <TopicActivity v-if="department?.id" :department-id="department.id" />

                <!-- Elite Novels Characters Cards -->
                <v-sheet style="background-color: transparent; box-shadow: none;"
                    v-if="isEliteNovels && characters?.length">
                    <v-toolbar title="Characters from Elite Novels" color="transparent">

                        <v-toolbar-items>
                            <v-btn class="ma-2" variant="text" href="https://elitenovels.com/characters">
                                View More Characters
                            </v-btn>
                        </v-toolbar-items>
                    </v-toolbar>
                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                            v-for="character in characters" :key="character.id">
                            <novelsCard :character="character" :class="['ma-4', selectedClass]" @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48">
                                    </v-icon>
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
    import EmptyCategory from '../../components/catalog/emptyCategory.vue'
    import exclusives from '../../components/catalog/product/exclusives.vue'
    import travel from '#commerce/app/components/catalog/categories/travel.vue'
    import deals from '#commerce/app/components/catalog/categories/deals.vue'
    import timeComponent from '#commerce/app/components/catalog/categories/time/time.vue'
    import weather from '#commerce/app/components/catalog/categories/weather/weather.vue'
    import adultstore from '#commerce/app/components/catalog/categories/adultstore.vue'
    import pantry from '#commerce/app/components/catalog/categories/pantry/pantry.vue'
    import novelsCard from '#commerce/app/components/related/novelsCard.vue'
    import storyCard from '#commerce/app/components/related/storyCard.vue'
    import TopicActivity from '#social/app/components/related/topicActivity.vue'
    import { useNearViewport } from '#shared/app/composables/useNearViewport'
    import shortsCard from '#social/app/components/related/short.vue'
    import SortFilterBar from '#shared/app/components/SortFilterBar.vue'
    import { useSortFilter } from '#shared/app/composables/useSortFilter'
    import { productSortFilter } from '../../utils/productSortFilter'
    import { PRODUCT_FIELDS } from '../../utils/productFields'

    import {
        ref,
        computed,
        watch
    } from '#imports'
    import {
        CommerceBackendRegistry
    } from 'alternate-sdk'

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
                // Named columns, not `*` (utils/productFields.ts), plus each
                // product's categories for the Category filter.
                ...PRODUCT_FIELDS.map((f) => `products.products_id.${f}`),
                'products.products_id.image.*',
                'products.products_id.categories.categories_id',
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
    }, {
        watch: [departmentSlug]
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
    }, {
        watch: [department]
    })

    watch(backendCategoryProducts, (products) => {
        if (products && department.value) {
            department.value.products = products.map((product) => ({
                products_id: product
            }))
        }
    }, {
        immediate: true
    })

    // These department-scoped queries filter the `departments` collection
    // itself (to match slug + the relevant products/showcases condition)
    // but the template renders a flat list of products, so the nested
    // products.products_id relation is extracted out here.
    const extractProducts = (departments) =>
        (Array.isArray(departments) ? departments : [])
        .flatMap((dept) => dept?.products || [])
        .map((p) => p?.products_id)
        .filter(Boolean)

    // The "Products" row near the top: the department's published products
    // (already loaded above), or the commerce backend's.
    const latestProducts = computed(() => usingBackendCatalog.value
        ? (backendCategoryProducts.value ?? []).slice(0, 10)
        : extractProducts([department.value]).filter((p) => !p.status || p.status === 'published').slice(0, 10))

    // Best Sellers and Events load in the browser once the visitor scrolls
    // near them (/api/commerce/department-sections, cached on the server),
    // so the page renders without waiting for them. Best Sellers is a
    // Directus showcase and Events a Directus product type, with no
    // equivalent in other commerce backends: there, Best Sellers shows the
    // backend's products and Events nothing.
    const lowerSections = ref(null)
    const nearLowerSections = useNearViewport(lowerSections)
    const {
        data: sections,
        execute: loadSections
    } = useLazyAsyncData(() => `department-sections-${departmentSlug.value}`,
        () => $fetch('/api/commerce/department-sections', { query: { slug: departmentSlug.value } }).catch(() => null), {
            server: false,
            immediate: false,
            default: () => null,
        })
    watch([nearLowerSections, departmentSlug], ([near]) => {
        if (near && !usingBackendCatalog.value && departmentSlug.value) loadSections()
    })
    const best = computed(() => usingBackendCatalog.value
        ? (backendCategoryProducts.value ?? []).slice(0, 10)
        : (sections.value?.best ?? []))
    const events = computed(() => (usingBackendCatalog.value ? [] : (sections.value?.events ?? [])))

    // Elite Novels' characters and stories, from elitenovels.com's own Directus.
    const isEliteNovels = computed(() => department.value?.slug === 'elite-novels')
    const eliteNovels = (kind) => useLazyAsyncData(`elitenovels-${kind}`,
        () => (isEliteNovels.value ? $fetch('/api/commerce/elitenovels', { query: { kind } }).catch(() => []) : Promise.resolve([])),
        { default: () => [], watch: [isEliteNovels] })
    const { data: characters } = eliteNovels('characters')
    const { data: stories } = eliteNovels('stories')

    // The department's categories as a tree: its top-level categories, each
    // with the subcategories under it (categories.parent — e.g. Pixanomy ›
    // Photography › Travel). A category whose parent isn't in this
    // department shows at the top level.
    const categoryGroups = computed(() => {
        const list = (department.value?.categories || []).map((rel) => rel?.categories_id).filter((c) => c?.id)
        const ids = new Set(list.map((c) => c.id))
        const parentId = (c) => (c.parent && typeof c.parent === 'object' ? c.parent.id : c.parent)
        const byName = (a, b) => String(a.name || '').localeCompare(String(b.name || ''))
        return list
            .filter((c) => !ids.has(parentId(c)))
            .sort(byName)
            .map((category) => ({
                category,
                children: list.filter((c) => parentId(c) === category.id).sort(byName),
            }))
    })

    // The products grid: search, sort and filter (by price, category and
    // seller), kept in the page address (?sort=price-asc&category=12).
    const gridProducts = computed(() => (department.value?.products || [])
        .map((rel) => rel?.products_id)
        .filter((p) => p && typeof p === 'object'))
    // A product's category ids (from Directus; store products carry none).
    const productCategoryIds = (p) => new Set((p?.categories || [])
        .map((rel) => (rel && typeof rel === 'object' ? (rel.categories_id?.id ?? rel.categories_id) : null))
        .filter((id) => id != null)
        .map(String))
    const productControls = useSortFilter(productSortFilter('products', () => gridProducts.value, [{
        key: 'category',
        title: 'Category',
        multiple: true,
        // Only the categories some product here is in; choosing one also
        // matches its subcategories.
        options: () => categoryGroups.value
            .filter((group) => gridProducts.value.some((p) => {
                const ids = productCategoryIds(p)
                return [group.category, ...group.children].some((c) => ids.has(String(c.id)))
            }))
            .map((group) => ({ value: String(group.category.id), title: group.category.name })),
        match: (p, value) => {
            const group = categoryGroups.value.find((g) => String(g.category.id) === value)
            const ids = productCategoryIds(p)
            return !!group && [group.category, ...group.children].some((c) => ids.has(String(c.id)))
        },
    }]))
    const shownProducts = computed(() => productControls.apply(gridProducts.value))

    useHead({
        title: computed(() => department?.value?.name || 'Department Page')
    });
</script>