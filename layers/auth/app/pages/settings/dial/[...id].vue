<template>
    <div>
        <v-toolbar extended>
            <v-toolbar-title>{{ dial.value?.name }}'s member details</v-toolbar-title>

            <v-toolbar-items>
                {{ dial?.ageStatus }} {{ dial?.accountStatus }}
            </v-toolbar-items>

            <v-toolbar-items>
                {{ dial?.email }}
            </v-toolbar-items>
        </v-toolbar>

        <v-container fluid>
            <v-row>
                <v-col cols="4">
                    <v-list-subheader>Name</v-list-subheader>
                </v-col>

                <v-col cols="8">
                    <v-text-field label="A preferred or chosen name you use in different programs"
                        :v-model="dial?.name"></v-text-field>
                </v-col>
            </v-row>

            <v-divider></v-divider>

            <v-row>
                <v-col cols="4">
                    <v-list-subheader>Profile Picture</v-list-subheader>
                </v-col>

                <v-col cols="8">
                    <v-text-field label="Take and upload photos to customize your profile picture"
                        :v-model="dial?.image?.filename_disk"></v-text-field>
                </v-col>
            </v-row>

            <v-divider></v-divider>

            <v-row>
                <v-col cols="4">
                    <v-list-subheader>Mobile number</v-list-subheader>
                </v-col>

                <v-col cols="8">
                    <v-text-field label="Receive important alerts for your profile here"
                        :v-model="dial?.phone"></v-text-field>
                </v-col>
            </v-row>

            <v-divider></v-divider>

            <v-row>
                <v-col cols="4">
                    <v-list-subheader>PIN Number</v-list-subheader>
                </v-col>

                <v-col cols="8">
                    <v-text-field label="Some Amazon programs require a PIN for additional security"
                        :v-model="dial?.pin"></v-text-field>
                </v-col>
            </v-row>

            <v-divider></v-divider>

            <h2 class="programHeader">Active Programs</h2>
            <p class="programDescription">This member is using the following Meeovi programs.</p>
            <v-row>
                <v-col cols="4">
                    <v-list-subheader>Active Programs</v-list-subheader>
                </v-col>

                <v-row>
                    <v-col>
                        <v-card append-icon="fas fa-up-right-from-square" class="mx-auto"
                            :href="dial?.products?.products_id?.slug" max-width="344" prepend-icon="fas fa-link"
                            rel="noopener" :subtitle="dial?.products?.products_id?.description" target="_blank"
                            :title="dial?.products?.products_id?.name"></v-card>
                    </v-col>
                </v-row>
            </v-row>
        </v-container>
    </div>
</template>

<script setup>
    import {
        useHead,
        createError
    } from 'nuxt/app'

    const {
        $directus,
        $readItem
    } = useNuxtApp()
    const route = useRoute()

    const {
        data: dial
    } = await useAsyncData('dial', () => {
        return $directus.request(
            $readItem('speeddials', {
                fields: ['*', {
                    slug: route.params.slug,
                    image: ['filename_disk']
                }],
            })
        )
    })

    const {
        data: dialPrograms
    } = await useAsyncData('dialPrograms', () => {
        return $directus.request(
            $readItem('speeddials', {
                fields: ['*', {
                    slug: route.params.slug,
                    image: ['filename_disk']
                }],
                filter: {
                    products: {
                        products_id: {
                            type: {
                                _eq: 'Subscriptions'
                            },
                            status: {
                                _eq: 'active'
                            },
                            user: {
                                id: {
                                    _eq: route.params.id
                                }
                            }
                        }
                    }
                }
            })
        )
    })

    if (!dial.value) throw createError({
        statusCode: 404,
        statusMessage: 'Person Not Found'
    })

    useHead({
        title: dial.value.name
    })
</script>

<style>
.programHeader, .programDescription {
    text-align: left;
}

.programDescription {
    margin-bottom: 2rem;
    color: var(--v-theme-text-secondary);
}
</style>