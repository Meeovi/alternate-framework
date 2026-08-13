<template>
    <div>
        <v-row v-if="coupons?.length">
            <v-col cols="12" sm="6" md="4" v-for="coupon in coupons" :key="coupon.id">
                <v-card :title="coupon?.name">
                    <v-card-text>
                        <p>Code: {{ coupon?.coupon_code }}</p>
                        <p>Discount: {{ coupon?.discount_amount }} {{ coupon?.discount_type }}</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn :to="`/coupon/${coupon?.id}`" color="primary" variant="text">View</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
        <p v-else>{{ loadError || 'No coupons available right now.' }}</p>
    </div>
</template>

<script setup>
    import { ref } from 'vue'

    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const loadError = ref('')

    const { data: coupons } = await useAsyncData('promotionCoupons', async () => {
        try {
            return await $directus.request($readItems('coupons', {
                filter: { is_active: { _eq: true } }
            }))
        } catch (err) {
            loadError.value = 'Coupons are unavailable right now.'
            return []
        }
    })
</script>
