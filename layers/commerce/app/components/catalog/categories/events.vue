<template>
    <div>
        <v-card elevation="0" style="min-height: 100vh !important;">
            <v-layout>
                <v-main>
                    <v-tabs center-active v-model="tab" bg-color="transparent">
                        <div v-for="(menu, index) in eventbar?.menus" :key="index">
                            <v-tab :value="menu?.value">{{ menu?.name }}</v-tab>
                        </div>
                    </v-tabs>

                    <v-card-text>
                        <v-tabs-window v-model="tab">
                            <v-tabs-window-item :value="eventbar?.menus?.[0]?.value">
                                <v-row>
                                    <v-col cols="3" v-for="products in eventProducts" :key="products">
                                        <productCard :product="products" />
                                    </v-col>
                                </v-row>
                            </v-tabs-window-item>

                            <v-tabs-window-item :value="eventbar?.menus?.[1]?.value">
                                <!-- Going To Event -->
                                <v-sheet style="background-color: transparent; box-shadow: none;"
                                    v-if="goingEvents?.length">
                                    <v-toolbar title="Going" color="transparent"></v-toolbar>
                                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                            v-for="product in goingEvents" :key="product.id">
                                            <productCard :product="product" :class="['ma-4', selectedClass]"
                                                @click="toggle" />
                                            <div class="d-flex fill-height align-center justify-center">
                                                <v-scale-transition>
                                                    <v-icon v-if="isSelected" color="white"
                                                        icon="fas fa-circle-xmark" size="48"></v-icon>
                                                </v-scale-transition>
                                            </div>
                                        </v-slide-group-item>
                                    </v-slide-group>
                                </v-sheet>

                                <!-- Invited to Event -->
                                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="invitesEvents?.length">
                                    <v-toolbar title="Invites" color="transparent"></v-toolbar>
                                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                            v-for="product in invitesEvents" :key="product.id">
                                            <productCard :product="product" :class="['ma-4', selectedClass]"
                                                @click="toggle" />
                                            <div class="d-flex fill-height align-center justify-center">
                                                <v-scale-transition>
                                                    <v-icon v-if="isSelected" color="white"
                                                        icon="fas fa-circle-xmark" size="48"></v-icon>
                                                </v-scale-transition>
                                            </div>
                                        </v-slide-group-item>
                                    </v-slide-group>
                                </v-sheet>

                                <!-- Interested in Event -->
                                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="interestedEvents?.length">
                                    <v-toolbar title="Interested" color="transparent"></v-toolbar>
                                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                            v-for="product in interestedEvents" :key="product.id">
                                            <productCard :product="product" :class="['ma-4', selectedClass]"
                                                @click="toggle" />
                                            <div class="d-flex fill-height align-center justify-center">
                                                <v-scale-transition>
                                                    <v-icon v-if="isSelected" color="white"
                                                        icon="fas fa-circle-xmark" size="48"></v-icon>
                                                </v-scale-transition>
                                            </div>
                                        </v-slide-group-item>
                                    </v-slide-group>
                                </v-sheet>

                                <!-- Hosting these Events -->
                                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="hostingEvents?.length">
                                    <v-toolbar title="Hosting" color="transparent"></v-toolbar>
                                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                            v-for="product in hostingEvents" :key="product.id">
                                            <productCard :product="product" :class="['ma-4', selectedClass]"
                                                @click="toggle" />
                                            <div class="d-flex fill-height align-center justify-center">
                                                <v-scale-transition>
                                                    <v-icon v-if="isSelected" color="white"
                                                        icon="fas fa-circle-xmark" size="48"></v-icon>
                                                </v-scale-transition>
                                            </div>
                                        </v-slide-group-item>
                                    </v-slide-group>
                                </v-sheet>

                                <!-- Past Events -->
                                <v-sheet style="background-color: transparent; box-shadow: none;" v-if="pastEvents?.length">
                                    <v-toolbar title="Past Events" color="transparent"></v-toolbar>
                                    <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                                            v-for="product in pastEvents" :key="product.id">
                                            <productCard :product="product" :class="['ma-4', selectedClass]"
                                                @click="toggle" />
                                            <div class="d-flex fill-height align-center justify-center">
                                                <v-scale-transition>
                                                    <v-icon v-if="isSelected" color="white"
                                                        icon="fas fa-circle-xmark" size="48"></v-icon>
                                                </v-scale-transition>
                                            </div>
                                        </v-slide-group-item>
                                    </v-slide-group>
                                </v-sheet>
                            </v-tabs-window-item>
                        </v-tabs-window>
                    </v-card-text>
                </v-main>
            </v-layout>
        </v-card>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import productCard from '../product/productCard.vue'
    import { useAuth } from '#auth/app/composables/useAuth'

    const { data: session } = await useAuth().getSession()
    const userId = session?.user?.id ?? null

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()

    const {
        data: eventbar
    } = await useAsyncData('eventbar', () => {
        return $directus.request($readItem('navigation', '80', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    // product_types is a M2M relation (products -> product_types via
    // product_types_id, an integer FK) — filtering product_types_id
    // directly against a string name is an int-vs-string mismatch Directus
    // rejects outright. The real vocabulary name lives one level deeper,
    // at product_types_id.name. `status` values are lowercase
    // ('published'/'draft'/'archived', confirmed against the live field's
    // choices) — the capitalized 'Published'/'Archived' used before never
    // matched anything.
    const {
        data: eventProducts
    } = await useAsyncData('eventProducts', () => {
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                product_types: {
                    product_types_id: {
                        name: { _eq: 'Event' }
                    }
                }
            }
        }))
    })

    // NOTE: there's no RSVP/attendee data model in the live schema —
    // `products.event_status` doesn't exist (confirmed), and there's no
    // separate attendee-status collection either. The four "my events"
    // sections below (Going/Invited/Interested/Hosting) can't actually be
    // distinguished from each other until that model exists, so all four
    // currently show the same "published events I'm linked to" list
    // rather than guessing at a field that isn't there. `user` is a M2M
    // through the products_directus_users junction, whose real fields are
    // product_id/user_id — there's no `directus_users` field on it.
    const myEventsFilter = {
        product_types: {
            product_types_id: {
                name: { _eq: 'Event' }
            }
        },
        status: {
            _eq: 'published'
        },
        user: {
            user_id: {
                _eq: userId
            }
        }
    }

    const {
        data: goingEvents
    } = await useAsyncData('goingEvents', () => {
        if (!userId) return []
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: myEventsFilter
        }))
    })

    const {
        data: invitesEvents
    } = await useAsyncData('invitesEvents', () => {
        return []
    })

    const {
        data: interestedEvents
    } = await useAsyncData('interestedEvents', () => {
        return []
    })

    const {
        data: hostingEvents
    } = await useAsyncData('hostingEvents', () => {
        return []
    })

    const {
        data: pastEvents
    } = await useAsyncData('pastEvents', () => {
        if (!userId) return []
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                product_types: {
                    product_types_id: {
                        name: { _eq: 'Event' }
                    }
                },
                status: {
                    _eq: 'archived'
                },
                user: {
                    user_id: {
                        _eq: userId
                    }
                }
            }
        }))
    })

    const tab = ref(null)
    const props = defineProps({
        category: {
            type: String,
            required: true,
        },
    });

    useHead({
        title: 'Events',
    })
</script>