<template>
    <div>
        <v-card variant="text">
            <v-toolbar
                :style="`background-color: ${showcasePage?.color}; color: ${showcasePage?.colortext} !important`">
                <v-toolbar-title>{{ showcasePage?.name }}</v-toolbar-title>

                <v-tabs v-model="currentTab" fixed-tabs>

                    <v-tab :value="'create'">
                        <createshowcase />
                    </v-tab>
                </v-tabs>
            </v-toolbar>

            <v-tabs-window v-model="currentTab">
                <v-tabs-window-item v-for="(menu, index) in showcaseBar" :key="menu?.value ?? index"
                    :value="menu?.value ?? menu">
                    <component :is="contentComponents[index] || null" />
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card>

        <section data-bs-version="5.1" class="features03 flavorm5 cid-uHg490M3EL" id="features03-at">
            <div class="container">
                <div class="row">
                    <div class="item features-image col-12 col-lg-6" v-for="(list, index) in lists" :key="index">
                        <listShowcases :list="list" />
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    import createshowcase from '@/components/catalog/product/add-showcase.vue'
    import listShowcases from '#lists/app/components/related/list.vue'

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()

    // current selected tab value (matches menu.value)
    const currentTab = ref(null);

    const {
        data: showcasePage
    } = await useAsyncData('showcasePage', () => {
        return $directus.request($readItem('pages', '115', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: lists
    } = await useAsyncData('lists', () => {
        return $directus.request($readItems('lists', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                lists_type: {
                    lists_type_id: {
                        name: {
                            _eq: "Showcase"
                        }
                    }
                },
                status: {
                    _eq: "Public"
                }
            }
        }))
    })

    const {
        data: showcaseBar
    } = await useAsyncData('showcaseBar', () => {
        return $directus.request($readItem('navigation', '54', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })
</script>