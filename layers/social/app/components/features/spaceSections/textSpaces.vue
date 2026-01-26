<template>
    <div>
        <v-col cols="12">
            <v-sheet class="mx-auto">
                <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                    <v-slide-group-item v-for="space in myTextSpaces" :key="space.id"
                        v-slot="{ isSelected, toggle, selectedClass }">
                        <spaceCard :space="space" :class="['ma-4', selectedClass]" v-if="isSelected" @click="toggle" />
                    </v-slide-group-item>
                </v-slide-group>
            </v-sheet>
        </v-col>

        <v-row class="member-cards">
            <v-col cols="3" v-for="space in textSpaces" :key="space.id" class="d-inline-block">
                <spaceCard :space="space" />
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
    import spaceCard from '~/components/related/space.vue'
    import {
        useUserStore
    } from '#auth/app/stores/user'

    const userStore = useUserStore()
    const userDisplayName = computed(() => {
        return userStore.user?.name || userStore.user?.username || 'User'
    })
        
    const model = ref(null)
    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const {
        data: myTextSpaces
    } = await useAsyncData('myTextSpaces', () => {
        return $directus.request($readItems('spaces', {
            filter: {
                owner: {
                    first_name: {
                     _eq: userStore?.user?.firstName,   
                    },
                    last_name: {
                        _eq: userStore?.user?.lastName,
                    }
                },
                space_type: {
                    space_types_id: {
                        name: {
                            _eq: 'Forum'
                        }
                    }
                }
            },
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: textSpaces
    } = await useAsyncData('textSpaces', () => {
        return $directus.request($readItems('spaces', {
            filter: {
                space_type: {
                    space_types_id: {
                        name: {
                            _eq: 'Forum'
                        }
                    }
                }
            },
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })
</script>