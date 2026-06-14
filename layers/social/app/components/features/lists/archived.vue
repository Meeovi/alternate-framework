<template>
    <div>
        <section data-bs-version="5.1" class="features4 start cid-v0Her0Ajsb" id="features04-1">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12 content-head">
                        <div class="mbr-section-head mb-5">
                            <h4 class="mbr-section-title mbr-fonts-style align-center mb-0 display-2">
                                <strong>My Archived Lists</strong>
                            </h4>

                            <div class="row">
                                <div class="item features-image col-12 col-md-6 col-lg-4" v-for="list in archived" :key="list.id">
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
    import listCard from '#social/app/components/related/list.vue'
    import { computed, useCurrentUser } from '#imports'

    const { $directus, $readItems } = useNuxtApp()
    const currentUser = useCurrentUser()
    const userDisplayName = computed(() => {
        return currentUser.value?.name || currentUser.value?.username || ''
    })

    const { data: lists } = await useAsyncData('archivedLists', async () => {
        const opts = { filter: { status: { _eq: 'Archived' } } }
        const resp = await $directus.request($readItems('lists', opts))
        return resp?.data || resp
    })

    const { data: archived } = await useAsyncData('archived', async () => {
        const opts = {
            filter: {
                user: { _eq: userDisplayName?.value },
                status: { _eq: 'Archived' }
            }
        }
        const resp = await $directus.request($readItems('lists', opts))
        return resp?.data || resp
    })

    useHead({
        title: 'My Archived Lists - Meeovi Tasks'
    })
</script>
