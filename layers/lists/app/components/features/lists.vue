<template>
    <div>
        <section data-bs-version="5.1" class="features4 start cid-v0Her0Ajsb" id="features04-1">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12 content-head">
                        <div class="mbr-section-head mb-5">
                            <h4 class="mbr-section-title mbr-fonts-style align-center mb-0 display-2">
                                <strong>My Lists</strong>
                            </h4>

                            <div class="row">
                                <div class="item features-image col-12 col-md-6 col-lg-4" v-for="list in myLists" :key="list.id">
                                    <listCard :list="list" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    const content = useContentAdapter()

    const { data: lists } = await useAsyncData('publicLists', async () => {
        const opts = { filter: { status: { _eq: 'Public' } } }
        if (content && typeof content.readItems === 'function') {
            const resp = await content.readItems('lists', opts)
            return resp?.data || resp
        }
        const { $directus, $readItems } = useNuxtApp()
        return await $directus.request($readItems('lists', opts))
    })

    const { data: myLists } = await useAsyncData('myLists', async () => {
        const opts = { filter: { user: { _eq: userDisplayName?.value } } }
        if (content && typeof content.readItems === 'function') {
            const resp = await content.readItems('lists', opts)
            return resp?.data || resp
        }
        const { $directus, $readItems } = useNuxtApp()
        return await $directus.request($readItems('lists', opts))
    })

    useHead({
        title: 'My Lists - Meeovi Tasks'
    })
</script>