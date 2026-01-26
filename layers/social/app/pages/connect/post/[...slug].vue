<template>
    <div>
        <section data-bs-version="5.1" class="start article2 cid-v4JqojhMIl" id="article02-b9"
            data-sortbtn="btn-primary">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12 col-md-12 col-lg-6 image-wrapper">
                        <div v-if="post?.file?.filename_disk && post?.file?.filename_disk.endsWith('.mp4')">
                            <video :src="`${$directus.url}assets/${post?.file?.filename_disk}`"></video>
                        </div>

                        <div v-else-if="post?.audio?.filename_disk && post?.audio?.filename_disk.endsWith('.mp3')">
                            <audio :src="`${$directus.url}assets/${post?.audio?.filename_disk}`"></audio>
                        </div>

                        <div v-else-if="post?.image?.filename_disk && post?.image?.filename_disk.endsWith('.gif')">
                            <img loading="lazy" :src="`${$directus.url}assets/${post?.image?.filename_disk}`"
                                :alt="post?.title || 'No Title'" />
                        </div>

                        <div v-else>
                            <img class="w-100" src="../../../assets/images/image3.jpg" :alt="post?.title || 'No Title'" />
                        </div>

                    </div>
                    <div class="col-12 col-md-12 col-lg">
                        <div class="text-wrapper align-left">
                            <h1 class="mbr-section-title mbr-fonts-style text-black mb-4 display-2">
                                <strong class="auto-text">{{ post?.title }}</strong>
                            </h1>

                            <div class="row">
                                <div class="col-6">
                                    <reactions class="postReactions" />
                                </div>

                                <div class="col-6">
                                    <flag class="postFlag" :report="post?.id" />
                                </div>
                            </div>

                            <p class="mbr-text align-left mbr-fonts-style mb-4 display-7 auto-text">{{ post?.content }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section data-bs-version="5.1" class="social02 cid-v4JqDUvsT0 auto-text" id="social02-ba"
            data-sortbtn="btn-primary">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12 content-head">
                        <div class="mb-5">
                            <h6 class="mbr-section-title mbr-fonts-style align-center mb-0 display-2">
                                <strong>Details</strong>
                            </h6>

                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="item features-without-image col-12 col-md-6 col-lg-4">
                        <div class="item-wrapper">
                            <span class="mbr-iconfont m-auto mobi-mbri-smile-face mobi-mbri"></span>
                            <div class="card-box">
                                <h4 class="card-title mbr-fonts-style mb-1 display-7">
                                    <strong>Author</strong>
                                </h4>
                                <h5 class="card-text mbr-fonts-style display-7">
                                    <NuxtLink v-if="post?.author?.avatar?.filename_disk" :to="`/user/${post?.author?.id}`">
                                        <v-avatar :image="post?.author?.avatar"></v-avatar>
                                    </NuxtLink>

                                    <NuxtLink v-else :to="`/user/${post?.author?.id}`">
                                        <v-avatar image="../../../assets/images/background2.jpg" size="41"></v-avatar>
                                    </NuxtLink>
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-6 col-lg-4">
                        <div class="item-wrapper">
                            <span class="mbr-iconfont m-auto mobi-mbri-right mobi-mbri"></span>
                            <div class="card-box">
                                <h4 class="card-title mbr-fonts-style mb-1 display-7">
                                    <strong>Type</strong>
                                </h4>
                                <h5 class="card-text mbr-fonts-style display-7">
                                    {{ post?.type || 'Notes' }}
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-6 col-lg-4">
                        <div class="item-wrapper">
                            <span class="mbr-iconfont m-auto mobi-mbri-bookmark mobi-mbri"></span>
                            <div class="card-box">
                                <h4 class="card-title mbr-fonts-style mb-1 display-7">
                                    <strong>Published</strong>
                                </h4>
                                <h5 class="card-text mbr-fonts-style display-7">
                                    {{ post?.date_created ? new Date(post?.date_created).toLocaleDateString() : 'Unknown date' }}
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-6 col-lg-4">
                        <div class="item-wrapper">
                            <span class="mbr-iconfont m-auto mobi-mbri-bootstrap mobi-mbri"></span>
                            <div class="card-box">
                                <h4 class="card-title mbr-fonts-style mb-1 display-7">
                                    <strong>Topics</strong>
                                </h4>
                                <h5 class="card-text mbr-fonts-style display-7" v-for="tags in post?.tags">
                                    <tagCard :tag="tags.tags_id" />
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-6 col-lg-4">
                        <div class="item-wrapper">
                            <span class="mbr-iconfont m-auto mobi-mbri-growing-chart mobi-mbri"></span>
                            <div class="card-box">
                                <h4 class="card-title mbr-fonts-style mb-1 display-7">
                                    <strong>Views</strong>
                                </h4>
                                <h5 class="card-text mbr-fonts-style display-7">
                                    {{ post?.views }}
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-6 col-lg-4">
                        <div class="item-wrapper">
                            <span class="mbr-iconfont m-auto mobi-mbri-share mobi-mbri"></span>
                            <div class="card-box">
                                <h4 class="card-title mbr-fonts-style mb-1 display-7">
                                    <strong>Share</strong>
                                </h4>
                                <h5 class="card-text mbr-fonts-style display-7">
                                    <share />
                                </h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="col-sm-6 col-lg-12 feedPost">
            <v-divider></v-divider>

            <comments id="postComments" :contentId="post?.id" />
        </div>
    </div>
</template>

<script setup>
    import share from '~/components/blocks/share.vue';
    import tagCard from '~/components/related/tag.vue';
    import flag from '~/components/blocks/flag.vue';
    import reactions from '~/components/blocks/reactions.vue';
    import comments from '~/components/blocks/comments.vue';
    import {
        onMounted,
        computed,
        ref
    } from 'vue'
    import {
        useReactionsStore
    } from '~/stores/reactions'

    const route = useRoute();
    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const slugParam = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug

    const {
        data: post
    } = await useAsyncData('post', () => {
        return $directus.request($readItems('posts', {
            filter: {
                slug: {
                    _eq: `${slugParam}`
                }
            },
            fields: [
                '*',
                'author.*',
                'image.*',
                'file.*',
                'audio.*'
            ],
            limit: 1
        })).then(response => response?.[0])
    })

    const reactionsStore = useReactionsStore()
    const reactionState = computed(() => {
        if (!post?.value?.id) return {
            likeCount: 0,
            isLiked: false,
            loading: false
        }
        return reactionsStore.getItem(post.value.id, post.value?.type)
    })

    onMounted(async () => {
        if (post?.value?.id) {
            await reactionsStore.fetchReactions(post.value.id, post.value?.type)
        }
    })

    // Cusdis comment properties derived from this page's data
    const config = useRuntimeConfig ? useRuntimeConfig() : {}
    const cusdisHost = config.public?.cusdisHost || 'https://cusdis.com'
    const cusdisAppId = config.public?.cusdisAppId || 'APP_ID'
    const pageId = computed(() => post?.value?.id ? String(post.value.id) : String(slugParam))
    const pageTitle = computed(() => post?.value?.title || String(slugParam))
    const pageUrl = ref('')
    onMounted(() => {
        if (process.client) pageUrl.value = window.location.href
    })

    useHead({
        title: post?.value?.title || 'Post Page',
    })
</script>