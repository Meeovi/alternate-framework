<template>
    <div>
        <section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
            <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
            <div class="align-center container">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-8">
                        <h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
                            <strong> {{ invoicePage?.name }}</strong>
                        </h3>
                        <p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="invoicePage?.content"></p>
                    </div>
                </div>
            </div>
        </section>

        <v-card variant="text">
            <v-toolbar :style="`background-color: ${invoiceBar?.color}; color: ${invoiceBar?.colortext} !important`">
                <v-toolbar-title>{{ invoiceBar?.name }}</v-toolbar-title>

                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in invoiceBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${invoiceBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab">
            <!--Invoices-->
            <v-tabs-window-item :value="invoiceBar?.menus?.[0]?.value">
                <v-row class="media-container-row">
                    <template v-if="invoices?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="transaction in invoices" :key="transaction.id">
                            <invoiceCard :post="transaction" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Invoices Available</div>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
    </div>
</template>

<script setup>
    import {
        ref,
        computed
    } from 'vue'
    import invoiceCard from '~/components/related/invoiceCard.vue'
    import {
        useUserStore
    } from '#auth/app/stores/user'

    const user = useSupabaseUser()

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()
    const tab = ref(null);

    const {
        data: invoiceBar
    } = await useAsyncData('invoiceBar', async () => {
        const resp = await $directus.request($readItem('navigation', '118', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
        return resp?.data ?? resp ?? null
    })

    const {
        data: invoicePage
    } = await useAsyncData('invoicePage', () => {
        return $directus.request($readItem('pages', '86', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: invoices
    } = await useAsyncData('invoices', async () => {
        const resp = await $directus.request($readItems('invoices', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: user.id
                }
            }
        }))
        return resp?.data ?? resp ?? []
    })

    useHead({
        title: 'Invoices',
    })
</script>