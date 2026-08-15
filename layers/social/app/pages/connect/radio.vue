<template>
    <div class="contentPage">
        <v-card variant="text">
            <v-toolbar :style="`background-color: ${radioBar?.color}; color: ${radioBar?.colortext} !important`">
                <v-toolbar-title>
                    <div class="listsToolbarTitle">
                        {{ radioPage?.name }}
                        <v-tooltip interactive>
                            <template v-slot:activator="{ props: activatorProps }">
                                <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                            </template>
                            <div>
                                <p class="listsToolbarTooltip" v-dompurify-html="radioPage?.content"></p>
                            </div>
                        </v-tooltip>
                    </div>
                </v-toolbar-title>

                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in radioBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${radioBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab">
            <v-tabs-window-item :value="radioBar?.menus?.[0]?.value">
                <v-sheet class="pa-5">
                    <div v-for="station in stations" :key="station.id" class="d-inline-block">
                        <stationCard :radio="station" />
                    </div>
                </v-sheet>
            </v-tabs-window-item>

            <v-tabs-window-item :value="radioBar?.menus?.[1]?.value">
                <v-sheet class="pa-5">
                    <div v-for="station in myStations" :key="station.id" class="d-inline-block">
                        <stationCard :radio="station" />
                    </div>
                </v-sheet>
            </v-tabs-window-item>
        </v-tabs-window>
    </div>
</template>

<script setup>
    import {
        ref
    } from '#imports';
    import stationCard from '#social/app/components/related/radio.vue'

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()

    const currentUser = useCurrentUser()

    const tab = ref(null)
    const loading = ref(true)

    const {
        data: radioPage
    } = await useAsyncData('radioPage', () => {
        return $directus.request($readItem('pages', '97', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: stations
    } = await useAsyncData('stations', () => {
        return $directus.request($readItems('radios', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: myStations
    } = await useAsyncData('myStations', () => {
        // `session` was referenced here but never declared anywhere in this
        // file — this threw on every load. radios also has no per-user
        // ownership field of its own (only Directus's auto-managed
        // user_created/user_updated), so "my stations" is approximated by
        // who Directus recorded as the creator — accurate only if stations
        // are ever created under each user's own Directus identity rather
        // than a single shared service token.
        if (!currentUser.value?.id) return []
        return $directus.request($readItems('radios', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_created: {
                    _eq: currentUser.value.id
                }
            }
        }))
    })

    const {
        data: radioBar
    } = await useAsyncData('radioBar', () => {
        return $directus.request($readItem('navigation', '34', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    useHead({
        title: 'Meeovi Radio',
    })
</script>