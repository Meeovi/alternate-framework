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

        <!-- Search, sort and filter stations on both tabs (kept in the page address) -->
        <SortFilterBar :controller="stationControls" :count="shownStations.length + shownMine.length"
            :total="(stations || []).length + (myStations || []).length" noun="stations"
            search-label="Search stations" />
        <v-tabs-window v-model="tab">
            <v-tabs-window-item :value="radioBar?.menus?.[0]?.value">
                <v-sheet class="pa-5">
                    <div v-for="station in shownStations" :key="station.id" class="d-inline-block">
                        <stationCard :radio="station" />
                    </div>
                </v-sheet>
            </v-tabs-window-item>

            <v-tabs-window-item :value="radioBar?.menus?.[1]?.value">
                <v-sheet class="pa-5">
                    <div v-for="station in shownMine" :key="station.id" class="d-inline-block">
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
    import SortFilterBar from '#shared/app/components/SortFilterBar.vue'
    import { choicesFrom, useSortFilter } from '#shared/app/composables/useSortFilter'
    import { contentSortFilter } from '../../utils/contentSortFilter'

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
        // radios.creator_id is the better-auth id, stamped by the CMS proxy
        // on create. The session is only known client-side (useCurrentUser
        // loads it on mount), so this runs once it arrives.
        if (!currentUser.value?.id) return Promise.resolve([])
        return $directus.request($readItems('radios', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                creator_id: {
                    _eq: currentUser.value.id
                }
            }
        }))
    }, {
        server: false,
        default: () => [],
        watch: [() => currentUser.value?.id]
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
        title: 'Radio',
    })

    // Station type (from the stations themselves) and search, on both tabs.
    const stationType = (station) => (typeof station?.type === 'object' ? station?.type?.name : station?.type) || ''
    const stationControls = useSortFilter(contentSortFilter('stations', {
        filters: [{
            key: 'type',
            title: 'Type',
            multiple: true,
            options: () => choicesFrom([...(stations.value || []), ...(myStations.value || [])], stationType),
            match: (station, value) => stationType(station).toLowerCase() === value.toLowerCase(),
        }],
    }))
    const shownStations = computed(() => stationControls.apply(stations.value))
    const shownMine = computed(() => stationControls.apply(myStations.value))
</script>