<template>
    <div>
        <section data-bs-version="5.1" class="features4 start cid-v0Her0Ajsb" id="features04-1">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12 content-head">
                        <div class="mbr-section-head mb-5">
                            <h4 class="mbr-section-title mbr-fonts-style align-center mb-0 display-2">
                                <strong>My Bookmarks</strong>
                            </h4>

                            <div class="row">
                                <div class="item features-image col-12 col-md-6 col-lg-4" v-for="bookmark in bookmarks" :key="bookmark.id">
                                    <bookmarkCard :bookmark="bookmark" />
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
    import {
        ref
    } from 'vue'
    import bookmarkCard from '~/components/related/bookmark.vue'
    import {
        useUserStore
    } from '#auth/app/stores/user'

    const userStore = useUserStore()
    const userDisplayName = computed(() => {
        return userStore.user?.name || userStore.user?.username || 'User'
    })

    const model = ref(null)

    const {
        $directus,
        $readItems
    } = useNuxtApp()

        const {
        data: bookmarks
    } = await useAsyncData('bookmarks', () => {
        return $directus.request($readItems('lists', {
            filter: {
                creator: {
                    _eq: userDisplayName.value,
                },
                type: {
                    _eq: "bookmark",
                }
            },
        }))
    })

    useHead({
        title: 'My Bookmarks Lists - Meeovi Tasks'
    })
</script>