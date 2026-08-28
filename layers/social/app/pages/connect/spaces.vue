<template>
    <div class="contentPage">
        <v-card variant="text">
            <v-toolbar :style="`background-color: ${spacesPage?.color}; color: ${spacesPage?.colortext} !important`">
                <v-toolbar-title>{{ spacesPage?.name }}</v-toolbar-title>

                <v-toolbar-title>
                    <div class="listsToolbarTitle">
                        {{ spacesPage?.name }}
                        <v-tooltip interactive>
                            <template v-slot:activator="{ props: activatorProps }">
                                <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                            </template>
                            <div>
                                <p class="listsToolbarTooltip" v-dompurify-html="spacesPage?.content"></p>
                            </div>
                        </v-tooltip>
                    </div>
                </v-toolbar-title>

                <v-dialog v-model="dialog" :scrim="false" max-width="720" transition="dialog-bottom-transition">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" class="ms-2" variant="outlined" size="small">
                            <v-icon start icon="fas fa-plus"></v-icon>New Space
                        </v-btn>
                    </template>
                    <v-card class="b-1">
                        <v-card-title>
                            <h3>Create New Space</h3>
                        </v-card-title>

                        <v-card-text>
                            <DynamicForm collection="spaces" />
                        </v-card-text>
                    </v-card>
                </v-dialog>

                <v-spacer></v-spacer>

                <v-tabs v-model="currentTab" fixed-tabs>
                    <v-tab v-for="(menu, index) in tabsList" :key="menu?.value ?? index" :value="menu?.value ?? menu">
                        <v-chip>{{ menu?.title || menu?.name || menu?.value }}</v-chip>
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
    } from '#imports'
    import {
        componentMap
    } from '~/types/componentMap'
    import { DynamicForm } from '@mframework/meeovi-forms'

    // current selected tab value (matches menu.value)
    const currentTab = ref(null);
    const dialog = ref(false);

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

    useHead({
        title: 'Spaces',
    })
</script>