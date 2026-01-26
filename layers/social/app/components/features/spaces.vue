<template>
    <div>
        <section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
            <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
            <div class="align-center container">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-8">
                        <h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
                            <strong> {{ spacePage?.name }}</strong>
                        </h3>
                        <p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="spacePage?.content"></p>
                    </div>
                </div>
            </div>
        </section>

        <v-card variant="text">
            <v-toolbar :style="`background-color: ${spacesPage?.color}; color: ${spacesPage?.colortext} !important`">
                <v-toolbar-title>{{ spacesPage?.name }}</v-toolbar-title>

                <v-tabs v-model="currentTab" fixed-tabs>
                    <v-tab v-for="(menu, index) in tabsList" :key="menu?.value ?? index" :value="menu?.value ?? menu">
                        <v-chip>{{ menu?.title || menu?.name || menu?.value }}</v-chip>
                    </v-tab>

                    <!--<v-menu v-if="tabsList?.length">
                        <template v-slot:activator="{ props }">
                            <v-btn class="align-self-center me-4" height="100%" rounded="0" variant="plain"
                                v-bind="props">
                                Filter
                                <v-icon icon="mdi-menu-down" end></v-icon>
                            </v-btn>
                        </template>

                        <v-list class="bg-grey-lighten-3">
                            <v-list-item v-for="(menu, index) in tabsList" :key="menu?.value ?? index"
                                :title="menu?.title || menu?.name || menu?.value" @click="selectTab(menu)">
                            </v-list-item>
                        </v-list>
                    </v-menu>-->

                    <v-tab :value="'create'">
                        <createspace />
                    </v-tab>
                </v-tabs>
            </v-toolbar>

            <v-tabs-window v-model="currentTab">
                <v-tabs-window-item v-for="(menu, index) in tabsList" :key="menu?.value ?? index"
                    :value="menu?.value ?? menu">
                    <component :is="contentComponents[index] || null" />
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card>
    </div>
</template>

<script setup>
    import {
        ref,
        computed,
        watch,
        defineAsyncComponent,
        markRaw
    } from 'vue'
    import createspace from '~/components/features/spaceSections/crud/add-space.vue'
    import { componentMap } from '~/types/componentMap'

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()

    // current selected tab value (matches menu.value)
    const currentTab = ref(null);

    const {
        data: spacesPage
    } = await useAsyncData('spacesPage', () => {
        return $directus.request($readItem('pages', '99', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: spacesBar
    } = await useAsyncData('spacesBar', () => {
        return $directus.request($readItem('navigation', '79', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    // Normalize menus to objects: support both string arrays and object arrays
    const tabsList = computed(() => {
        const raw = spacesBar?.value?.menus ?? []
        return raw.map((m) => (typeof m === 'string' ? {
            value: m,
            title: m
        } : m))
    })

    // Map the exported loaders to async components (preserve lazy loading)
    // markRaw each component so Vue doesn't make the component object reactive
    const contentComponents = componentMap.map((loader) => markRaw(defineAsyncComponent(loader)))

    // initialize currentTab when menus arrive
    watch(tabsList, (val) => {
        if (val?.length && !currentTab.value) {
            currentTab.value = val[0].value ?? val[0]
        }
    }, {
        immediate: true
    })

    function selectTab(menu) {
        currentTab.value = menu?.value ?? menu
    }

    useHead({
        title: 'Spaces',
    })
</script>