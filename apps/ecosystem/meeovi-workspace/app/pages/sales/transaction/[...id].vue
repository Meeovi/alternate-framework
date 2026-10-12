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
                                        <a class="card-text mbr-fonts-style display-7" :href="`/order/${transaction?.order}`">Order #:
                                            {{ transaction?.order }}</a>
                                        <p class="card-text mbr-fonts-style display-7">Transaction ID: {{ transaction?.id }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Transaction Date:
                                            {{ transaction?.date_created ? new Date(transaction.date_created).toLocaleDateString() : '' }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Type: {{ transaction?.type }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Payment Method: {{ transaction?.payment_method }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Amount: {{ transaction?.amount }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Status: {{ transaction?.status }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NuxtImg provider="cloudinary" src="https://via.placeholder.com/1200x400" :alt="transaction?.id" />
        </section>
    </div>
</template>

<script setup>
    import { useAuth } from '#auth/app/composables/useAuth'

    const route = useRoute();

    // [...id].vue is a catch-all route, so route.params.id is an array.
    const transactionId = computed(() =>
        Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    )

    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const { data: session } = await useAuth().getSession()
    const currentUserId = session?.user?.id ?? null

    const {
        data: transaction
    } = await useAsyncData('transaction', async () => {
        if (!currentUserId) return null
        // Explicit field list — transactions.invoices is a broken M2M
        // alias field (no relation config behind it in Directus), so an
        // unspecified/wildcard fields param throws a 500.
        const results = await $directus.request($readItems('transactions', {
            fields: ['id', 'order', 'date_created', 'type', 'payment_method', 'amount', 'status'],
            filter: {
                id: { _eq: transactionId.value },
                order: {
                    user_id: { _eq: currentUserId }
                }
            },
            limit: 1
        }))
        return results?.[0] ?? null
    })

    useHead({
        title: transaction?.value?.id ? `Transaction ${transaction.value.id}` : 'Transaction Page',
    })
</script>