<template>
    <div>
        <div class="wrap feedPost">
            <v-card class="card__wrap" height="550">
                <div class="cardWrapper">
                    <v-toolbar color="transparent" flat>
                        <v-toolbar-title>
                            <v-list>
                                <v-list-item :title="post?.author?.name"
                                    :subtitle="post?.date_created ? new Date(post?.date_created).toLocaleDateString() : 'Unknown date'"
                                    :prepend-avatar="getAssetUrl(post?.author?.avatar)"></v-list-item>
                            </v-list>
                        </v-toolbar-title>

                        <v-spacer></v-spacer>

                        <editMenu :post="post" />
                    </v-toolbar>
                    <div class="align-end text-white" height="200" v-if="post?.file">
                        <video :src="getAssetUrl(post?.file)"></video>
                    </div>

                    <div class="align-end text-white" height="200" v-else-if="post?.audio">
                        <audio :src="getAssetUrl(post?.audio)"></audio>
                    </div>

                    <div class="align-end text-white" height="200" v-else-if="matchesExtension(post?.image, ['.gif'])">
                        <NuxtImg provider="cloudinary" loading="lazy" :src="getAssetUrl(post?.image)"
                            :alt="post?.title || 'No Title'" />
                    </div>
                    <v-img v-else class="align-end text-white" height="200"
                        src="https://cdn.vuetifyjs.com/images/cards/docks.jpg" :alt="post?.title || 'No Title'" cover>
                        <v-card-title>{{ post?.title }}</v-card-title>
                    </v-img>

                    <v-card-subtitle class="pt-4">
                        {{ post?.description }}
                    </v-card-subtitle>

                    <v-card-text>
                        <p v-dompurify-html="post?.content" class="postContent"></p>
                    </v-card-text>

                    <v-card-actions>
                        <!--Reactions-->
                        <v-btn variant="text">
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn prepend-icon="fas fa-thumbs-up" title="React to this Post" text="React"
                                        v-bind="props" variant="text"></v-btn>
                                </template>
                                <v-list>
                                    <reactions :contentId="post?.reactions?.reactions_id" :contentType="post?.type" />
                                </v-list>
                            </v-menu>
                        </v-btn>

                        <!--Comments-->
                        <v-btn variant="text" class="mbr-section-btn">
                            <v-btn prepend-icon="fas fa-comment" title="Comment on this post" text="Comment"
                                variant="text" :href="`/connect/post/${post?.slug}`"></v-btn>
                        </v-btn>

                        <!--<v-btn variant="text" class="mbr-section-btn">
                            <repost :post="post" />
                        </v-btn>-->

                        <v-spacer></v-spacer>

                        <!--Share-->
                        <v-btn variant="text">
                            <share />
                        </v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </div>
    </div>
</template>

<script setup>
    import editMenu from '#social/app/components/blocks/postEditMenu.vue';
    import share from '#social/app/components/blocks/share.vue';
    import repost from '#social/app/components/blocks/repost.vue';
    import reactions from '#social/app/components/blocks/reactions.vue';
    import {
        toRef,
        onMounted,
        computed
    } from '#imports'
    import {
        useReactionsStore
    } from '../../stores/useReactionsStore'

    const props = defineProps({
        post: {
            type: Object,
            required: true,
        },
    });
    const post = toRef(props, 'post');

    const reactionsStore = useReactionsStore()
    const reactionState = computed(() => {
        const rid = post.value?.reactions?.reactions_id
        if (!rid) return {
            likeCount: 0,
            isLiked: false,
            loading: false
        }
        return reactionsStore.getItem(rid, post.value?.type)
    })

    onMounted(async () => {
        const rid = post.value?.reactions?.reactions_id
        if (rid) {
            await reactionsStore.fetchReactions(rid, post.value?.type)
        }
    })

    const directusUrl = useDirectusUrl?.()
    const getAssetUrl = (file) => {
        const fileId = file?.id || file?.directus_files_id?.id || file?.filename_disk || file
        if (!fileId || !directusUrl) return ''
        return `${directusUrl.replace(/\/$/, '')}/assets/${fileId}`
    }
    const fileNameOf = (file) => String(file?.filename_download || file?.title || file?.type || getAssetUrl(file) || '')
        .toLowerCase()
    const matchesExtension = (file, extensions) => extensions.some((ext) => fileNameOf(file).endsWith(ext))
</script>