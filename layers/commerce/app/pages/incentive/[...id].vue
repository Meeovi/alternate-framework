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
                                <template v-if="incentive">
                                    <p class="card-text mbr-fonts-style display-4">Incentive: {{ incentive?.id }}</p>
                                    <p class="card-text mbr-fonts-style display-4">Type: {{ incentive?.incentive_type }}</p>
                                    <p class="card-text mbr-fonts-style display-4">Amount: {{ incentive?.amount }}</p>
                                    <p class="card-text mbr-fonts-style display-4">Status: {{ incentive?.status }}</p>
                                    <p class="card-text mbr-fonts-style display-4">Issued: {{ incentive?.date_created ? new Date(incentive.date_created).toLocaleDateString() : '' }}</p>
                                    <p v-if="incentive?.expires_at" class="card-text mbr-fonts-style display-4">Expires: {{ new Date(incentive.expires_at).toLocaleDateString() }}</p>
                                </template>
                                <p v-else class="card-text mbr-fonts-style display-4">This incentive could not be found.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    import { useAuth } from '#auth/app/composables/useAuth'

    const route = useRoute();

    // [...id].vue is a catch-all route, so route.params.id is an array.
    const incentiveId = computed(() =>
        Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    )

    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const { data: session } = await useAuth().getSession()
    const userId = session?.user?.id ?? null

    const {
        data: incentive
    } = await useAsyncData('incentive', async () => {
        if (!userId) return null
        const results = await $directus.request($readItems('incentives', {
            filter: {
                id: { _eq: incentiveId.value },
                user_id: { _eq: userId }
            },
            limit: 1
        }))
        return results?.[0] ?? null
    })

    useHead({
        title: incentive?.value?.id ? `Incentive ${incentive.value.id}` : 'Incentive',
    })
</script>
