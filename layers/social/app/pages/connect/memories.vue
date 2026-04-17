<template>
    <div>
        <section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
            <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
            <div class="align-center container">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-8">
                        <h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
                            <strong> {{ memoryPage?.name }}</strong>
                        </h3>
                        <p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="memoryPage?.content"></p>
                    </div>
                </div>
            </div>
        </section>

        <v-row class="text-center">
            <v-col cols="3" v-for="historyPosts in historyPosts" :key="historyPosts">
                <postsCard :posts="historyPosts" />
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
    import { ref } from '#imports'
    import postsCard from '#social/app/components/related/post.vue'
    
    const { fetchSession } = useAuth()
    await fetchSession()
    import { useDirectusRequest } from '@mframework/adapter-directus'
    const { readItem, readItems } = useDirectusRequest()
    const route = useRoute()
    const tab = ref(null);

    const { data: memoryPage } = await useAsyncData('memoryPage', () => {
        return readItem('pages', '90', { fields: ['*', { '*': ['*'] }] })
    })

    const { data: historyPosts } = await useAsyncData('historyPosts', async () => {
        const resp = await readItems('posts', { fields: ['*', { '*': ['*'] }], filter: { date_created: { _lt: new Date().toISOString() } } })
        return resp?.data || resp || []
    })

    useHead({
        title: 'Memories Center',
    })
</script>