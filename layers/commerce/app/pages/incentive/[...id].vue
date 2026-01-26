<template>
    <div>
        <section data-bs-version="5.1" class="firmm4_features1 features1 cid-uhBuptnWmV" id="features1-9v"
            data-sortbtn="btn-primary">
            <div class="container-fluid">
                <div class="row justify-content-center">
                    <div class="card">
                        <div class="card_wrapper">
                            <div class="card-box">
                                <div class="icon_block">
                                    <div class="iconfont-wrapper">
                                        <span class="mbr-iconfont mobi-mbri-cart-full mobi-mbri"></span>
                                    </div>
                                </div>
                                <p class="card-text mbr-fonts-style display-4">Invoice: {{ invoice?.id }}</p>
                                <p class="card-text mbr-fonts-style display-4">Invoice Date: {{ new Date(invoice?.created_at).toLocaleDateString() }}</p>
                                <p class="card-text mbr-fonts-style display-4">Order #: {{ invoice?.order_id?.orders_id?.id }}</p>
                                <p class="card-text mbr-fonts-style display-4">Order Date: {{ new Date(invoice?.updated_at).toLocaleDateString() }}
                                </p>
                                <p class="card-text mbr-fonts-style display-4">Bill to Name: {{ invoice?.user?.first_name }} {{ invoice?.user?.last_name }}</p>
                                <p class="card-text mbr-fonts-style display-4">Status: {{ invoice?.state }}</p>
                                <p class="card-text mbr-fonts-style display-4">Grand Total (Base): {{ invoice?.base_grand_total }}</p>
                                <p class="card-text mbr-fonts-style display-4">Grand Total (Purchased): {{ invoice?.grand_total }}</p>
                                <p class="btn_link mbr-fonts-style display-4"><NuxtLink :to="`/commerce/invoice/${invoice?.id}`" class="text-secondary">View<span class="mobi-mbri mobi-mbri-right mbr-iconfont"></span></NuxtLink></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    import {
        ref,
        onMounted
    } from 'vue';
    const route = useRoute();
    const {
        $directus,
        $readItem
    } = useNuxtApp()
    const user = useSupabaseUser()

    const {
        data: invoice
    } = await useAsyncData('invoice', () => {
        return $directus.request($readItem('invoices', route.params.id, {
            filter: {
                user: {
                    _eq: `${user?.id}`
                }
            },
            limit: 1
        })).then(response => response?.[0])
    })

    useHead({
        title: 'Invoice' + invoice?.value?.id || 'Invoice Page',
    })

    definePageMeta({
        //middleware: ['auth-logged-in'],
    })
</script>