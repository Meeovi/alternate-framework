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
                                                        icon="mdi-close-circle-outline" size="48"></v-icon>
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
                                                        icon="mdi-close-circle-outline" size="48"></v-icon>
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
                                                        icon="mdi-close-circle-outline" size="48"></v-icon>
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
                                                        icon="mdi-close-circle-outline" size="48"></v-icon>
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
                                                        icon="mdi-close-circle-outline" size="48"></v-icon>
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
    import {
        authClient
    } from "#auth/lib/auth-client";

    const {
        data: session
    } = await authClient.useSession();

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
                        _eq: 'Event'
                    }
                }
            }
        }))
    })

    const {
        data: goingEvents
    } = await useAsyncData('goingEvents', () => {
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                product_types: {
                    product_types_id: {
                        _eq: 'Event'
                    }
                },
                status: {
                    _eq: 'Published'
                },
                event_status: {
                    _eq: 'Going'
                },
                user: {
                    directus_users: {
                        id: {
                            _eq: session.user.id
                        }
                    }
                }
            }
        }))
    })

    const {
        data: invitesEvents
    } = await useAsyncData('invitesEvents', () => {
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                product_types: {
                    product_types_id: {
                        _eq: 'Event'
                    }
                },
                status: {
                    _eq: 'Published'
                },
                event_status: {
                    _eq: 'Invites'
                },
                user: {
                    directus_users: {
                        id: {
                            _eq: session.user.id
                        }
                    }
                }
            }
        }))
    })

    const {
        data: interestedEvents
    } = await useAsyncData('interestedEvents', () => {
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                product_types: {
                    product_types_id: {
                        _eq: 'Event'
                    }
                },
                status: {
                    _eq: 'Published'
                },
                event_status: {
                    _eq: 'Interested'
                },
                user: {
                    directus_users: {
                        id: {
                            _eq: session.user.id
                        }
                    }
                }
            }
        }))
    })

    const {
        data: hostingEvents
    } = await useAsyncData('hostingEvents', () => {
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                product_types: {
                    product_types_id: {
                        _eq: 'Event'
                    }
                },
                status: {
                    _eq: 'Published'
                },
                event_status: {
                    _eq: 'Hosting'
                },
                user: {
                    directus_users: {
                        id: {
                            _eq: session.user.id
                        }
                    }
                }
            }
        }))
    })

    const {
        data: pastEvents
    } = await useAsyncData('pastEvents', () => {
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                product_types: {
                    product_types_id: {
                        _eq: 'Event'
                    }
                },
                status: {
                    _eq: 'Archived'
                },
                event_status: {
                    _eq: 'Past Events'
                },
                user: {
                    directus_users: {
                        id: {
                            _eq: session.user.id
                        }
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