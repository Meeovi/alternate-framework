<template>
    <div>
        <section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
            <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
            <div class="align-center container">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-8">
                        <h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
                            <strong> {{ incentivePage?.name }}</strong>
                        </h3>
                        <p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="incentivePage?.content"></p>
                    </div>
                </div>
            </div>
        </section>

        <v-card variant="text">
            <v-toolbar
                :style="`background-color: ${incentiveBar?.color}; color: ${incentiveBar?.colortext} !important`">
                <v-toolbar-title>{{ incentiveBar?.name }}</v-toolbar-title>


                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in incentiveBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${incentiveBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab">
            <!--Coupons-->
            <v-tabs-window-item :value="incentiveBar?.menus?.[0]?.value">
                <v-row class="media-container-row">
                    <template v-if="coupons?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="coupon in coupons" :key="coupon.id">
                            <incentiveCard :incentive="coupon" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Coupons Available</div>
                </v-row>
            </v-tabs-window-item>

            <!--Rewards-->
            <v-tabs-window-item :value="incentiveBar?.menus?.[1]?.value">
                <v-row class="media-container-row">
                    <template v-if="rewards?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="reward in rewards" :key="reward.id">
                            <incentiveCard :incentive="reward" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Rewards Available</div>
                </v-row>
            </v-tabs-window-item>

            <!--Credit Memos-->
            <v-tabs-window-item :value="incentiveBar?.menus?.[2]?.value">
                <v-row class="media-container-row">
                    <template v-if="creditMemos?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="creditMemo in creditMemos"
                            :key="creditMemo.id">
                            <incentiveCard :incentive="creditMemo" />
                        </v-col>
                    </template>

                    <div class="center-text" v-else>No Rewards Available</div>
                </v-row>
            </v-tabs-window-item>

            <!--Gift Cards-->
            <v-tabs-window-item :value="incentiveBar?.menus?.[3]?.value">
                <v-row class="media-container-row">
                    <template v-if="giftCards?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="giftCard in giftCards"
                            :key="giftCard.id">
                            <incentiveCard :incentive="giftCard" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Gift Cards Available</div>
                </v-row>
            </v-tabs-window-item>

            <!--Certificates-->
            <v-tabs-window-item :value="incentiveBar?.menus?.[3]?.value">
                <v-row class="media-container-row">
                    <template v-if="certificates?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="certificate in certificates"
                            :key="certificate.id">
                            <incentiveCard :incentive="certificate" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Certificates Available</div>
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
    import incentiveCard from '../related/incentiveCard.vue'
    import { useAuth } from '#auth/app/composables/useAuth'

    const { data: session } = await useAuth().getSession()
    const userId = session?.user?.id ?? null

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()
    const tab = ref(null);

    const {
        data: incentiveBar
    } = await useAsyncData('incentiveBar', async () => {
        const resp = await $directus.request($readItem('navigation', '118', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
        return resp?.data ?? resp ?? null
    })

    const {
        data: incentivePage
    } = await useAsyncData('incentivePage', () => {
        return $directus.request($readItem('pages', '86', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    // incentive_type is a plain string field on `incentives` (e.g. "Coupon",
    // "Reward", "Credit Memo") — not a relation, so it's compared directly.
    const fetchIncentives = (type) => useAsyncData(`incentives-${type}`, async () => {
        if (!userId) return []
        return $directus.request($readItems('incentives', {
            fields: ['*'],
            filter: {
                user_id: { _eq: userId },
                incentive_type: { _eq: type }
            }
        }))
    })

    const { data: coupons } = await fetchIncentives('Coupon')
    const { data: rewards } = await fetchIncentives('Reward')
    const { data: creditMemos } = await fetchIncentives('Credit Memo')

    // Gift cards and gift certificates are products, not incentives — the
    // dedicated /product/gift-cards page already covers this; the two tabs
    // that duplicated it here queried `products` for fields that don't
    // exist on that collection and always failed.
    const giftCards = ref([])
    const certificates = ref([])

    useHead({
        title: 'Incentives',
    })
</script>