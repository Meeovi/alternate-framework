<template>
    <div>
        <section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
            <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
            <div class="align-center container">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-8">
                        <h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
                            <strong> {{ transactionPage?.name }}</strong>
                        </h3>
                        <p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="transactionPage?.content"></p>
                    </div>
                </div>
            </div>
        </section>

        <v-card variant="text">
            <v-toolbar
                :style="`background-color: ${transactionBar?.color}; color: ${transactionBar?.colortext} !important`">
                <v-toolbar-title>{{ transactionBar?.name }}</v-toolbar-title>


                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in transactionBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${transactionBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab">
            <!--Transactions-->
            <v-tabs-window-item :value="transactionBar?.menus?.[0]?.value">
                <v-row class="media-container-row">
                    <template v-if="transactions?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="transaction in transactions" :key="transaction.id">
                            <postCard :post="transaction" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Transactions Available</div>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
    </div>
</template>

<script setup lang="ts">

    import {
        ref,
        computed
    } from '#imports'
    import postCard from '~/components/related/post.vue'


    // @ts-ignore - useAuth may not be globally available
    // import { useAuth } from '#auth/app/composables/useAuth'
    // const { user, fetchSession } = useAuth()
    // await fetchSession()
    // const getCurrentUserId = () => (user.value && (user.value.id || user.value.userId)) || null
    const currentUserId = null;

    const nuxtApp = useNuxtApp();
    const $gateway = nuxtApp.$gateway as any;
    const read = nuxtApp.read as any;
    const tab = ref(null);

    const { data: transactionBar } = await useAsyncData<any>('transactionBar', async () => {
        const resp = await $gateway.content?.(read('navigation', '118', {
            fields: ['*', { '*': ['*'] }]
        }))
        return resp?.data ?? resp ?? null
    })

    const { data: transactionPage } = await useAsyncData<any>('transactionPage', () => {
        return $gateway.content?.(read('pages', '86', {
            fields: ['*', { '*': ['*'] }]
        }))
    })

    const { data: transactions } = await useAsyncData<any>('transactions', async () => {
        if (!currentUserId) return []
        const resp = await $gateway.content?.(read('transactions', {
            fields: ['*', { '*': ['*'] }],
            filter: { user_id: { _eq: currentUserId } }
        }))
        return resp?.data ?? resp ?? []
    })

    useHead({
        title: 'Transactions',
    })
</script>