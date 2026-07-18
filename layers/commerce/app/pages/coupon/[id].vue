<template>
    <div class="contentPage">
        <!---->
        <section data-bs-version="5.1" class="features07 scalem5 cid-uhB4hw1yxB mbr-fullscreen" id="features07-9l">
            <div class="container">
                <div class="row">
                    <div class="col-12 col-lg-10 card">
                        <div class="title-wrapper">
                            <h2 class="mbr-section-title mbr-fonts-style display-5">
                                {{ coupon?.name }}</h2>
                        </div>
                    </div>
                    <div class="col-12 col-lg-8">
                        <div class="items-wrapper">
                            <div class="item features-without-image item-mb">
                                <div class="item-wrapper">
                                    <div class="card-box">
                                        <div class="icon-wrapper">
                                            <span class="mbr-iconfont mobi-mbri-cash mobi-mbri"></span>
                                        </div>
                                        <h4 class="card-title mbr-fonts-style display-7">
                                            Coupon Information
                                        </h4>
                                        <p class="card-text mbr-fonts-style display-7">Coupon Code: {{ coupon?.coupon_code }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Discount: {{ coupon?.discount_amount }} {{ coupon?.discount_type }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Usage per Customer: {{ coupon?.usage_per_customer }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Valid From: {{ new Date(coupon?.from_date).toLocaleDateString() }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Valid Until: {{ new Date(coupon?.to_date).toLocaleDateString() }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Usage Limit: {{ coupon?.usage_limit }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Times Used: {{ coupon?.times_used }}</p>
                                        
                                        <div class="mt-4">
                                            <v-text-field
                                                v-model="couponCode"
                                                label="Enter Coupon Code"
                                                :disabled="loading"
                                                :error-messages="error"
                                            ></v-text-field>
                                            <v-btn
                                                color="primary"
                                                :loading="loading"
                                                :disabled="loading || !couponCode"
                                                @click="applyCoupon"
                                            >
                                                Apply Coupon
                                            </v-btn>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NuxtImg loading="lazy" :src="`${$directus.url}/assets/${coupon?.image?.filename_disk}`"
                :alt="coupon?.name" />
        </section>
    </div>
</template>

<script setup>
    import {
        ref,
        onMounted
    } from 'vue';
    import { useQuery, useMutation } from '@vue/apollo-composable'
    import gql from 'graphql-tag'
    import { useRoute } from 'vue-router'

    const route = useRoute()
    const coupon = ref(null)
    const couponCode = ref('')
    const loading = ref(false)
    const error = ref('')

    // GraphQL query for coupon details
    const COUPON_DETAILS_QUERY = gql`
      query GetCouponDetails($ruleId: ID!) {
        coupon(rule_id: $ruleId) {
          rule_id
          name
          description
          from_date
          to_date
          is_active
          coupon_code
          discount_amount
          discount_type
          usage_limit
          usage_per_customer
          times_used
        }
      }
    `

    // GraphQL mutation for applying coupon
    const APPLY_COUPON_MUTATION = gql`
      mutation ApplyCoupon($couponCode: String!) {
        applyCoupon(input: { coupon_code: $couponCode }) {
          cart {
            applied_coupons {
              code
            }
          }
        }
      }
    `

    const { result, loading: queryLoading, error: queryError } = useQuery(COUPON_DETAILS_QUERY, {
        ruleId: route.params.id
    })

    const { mutate: applyCouponMutation, loading: mutationLoading } = useMutation(APPLY_COUPON_MUTATION)

    onMounted(() => {
        if (result.value?.coupon) {
            coupon.value = result.value.coupon
            couponCode.value = result.value.coupon.coupon_code
        }
    })

    const applyCoupon = async () => {
        try {
            loading.value = true
            error.value = ''

            const { data } = await applyCouponMutation({
                couponCode: couponCode.value
            })

            if (data?.applyCoupon?.cart?.applied_coupons) {
                error.value = 'Coupon applied successfully!'
            }
        } catch (err) {
            error.value = err.message || 'Failed to apply coupon'
        } finally {
            loading.value = false
        }
    }

    useHead({
        title: computed(() => coupon.value?.name || 'Coupon Details')
    })

    definePageMeta({
        middleware: ['authenticated'],
    })
</script>