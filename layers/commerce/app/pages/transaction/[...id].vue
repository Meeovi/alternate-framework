<template>
    <div>
        <!--<profilebar />-->
        <section data-bs-version="5.1" class="features07 scalem5 cid-uhB4hw1yxB mbr-fullscreen" id="features07-9l">
            <div class="container">
                <div class="row">
                    <div class="col-12 col-lg-10 card">
                        <div class="title-wrapper">
                            <h2 class="mbr-section-title mbr-fonts-style display-5">
                                View Transaction</h2>
                        </div>
                    </div>
                    <div class="col-12 col-lg-12">
                        <div class="items-wrapper">
                            <div class="item features-without-image item-mb">
                                <div class="item-wrapper">
                                    <div class="card-box">
                                        <div class="icon-wrapper">
                                            <span class="mbr-iconfont mobi-mbri-growing-chart mobi-mbri"></span>
                                        </div>
                                        <h4 class="card-title mbr-fonts-style display-7">
                                            Transaction Information
                                        </h4>
                                        <a class="card-text mbr-fonts-style display-7" :href="`/order/${transaction?.orders?.orders_id?.id}`">Order #:
                                            {{ transaction?.orders?.orders_id?.id }}</a>
                                        <p class="card-text mbr-fonts-style display-7">Transaction ID: {{ transaction?.id }}</p>    
                                        <p class="card-text mbr-fonts-style display-7">Transaction Date:
                                            {{ new Date(transaction?.created_at).toLocaleDateString() }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Is it Closed?
                                            {{ transaction?.is_closed }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Parent Transaction ID: {{ transaction?.parent_id }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Payment ID: {{ transaction?.payment_id }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <img src="../../assets/images/background10.jpg" :alt="transaction?.id">
        </section>
    </div>
</template>

<script setup>
    const route = useRoute();
    
    const {
        $directus,
        $readItem
    } = useNuxtApp()
    const user = useSupabaseUser()

    const {
        data: transaction
    } = await useAsyncData('transaction', () => {
        return $directus.request($readItem('transactions', route.params.id, {
            filter: {
                user: {
                    _eq: `${user?.id}`
                }
            },
            limit: 1
        })).then(response => response?.[0])
    })

    useHead({
        title: 'Transaction' + transaction?.value?.id || 'Transaction Page',
    })

    definePageMeta({
        //middleware: ['auth-logged-in'],
    })
</script>