<template>
    <div>
        <div>
            <div class="wrap feedPost">
                <v-card class="card__wrap" height="550">
                    <template #title class="postTitle">{{ post?.title }}</template>
                    <div class="image">
                        <div v-if="post?.file">
                            <video :src="getAssetUrl(post?.file)"></video>
                        </div>

                        <div v-else-if="post?.audio">
                            <audio :src="getAssetUrl(post?.audio)"></audio>
                        </div>

                        <div v-else-if="matchesExtension(post?.image, ['.gif'])">
                            <img loading="lazy" :src="getAssetUrl(post?.image)"
                                :alt="post?.title || 'No Title'" />
                        </div>

                        <div v-else>
                            <img loading="lazy" src="https://via.placeholder.com/800x450" :alt="post?.title || 'No Title'" />
                        </div>
                    </div>

                    <v-toolbar color="transparent" flat>
                        <v-toolbar-title>
                            <p class="card__date mbr-fonts-style display-4 auto-text">Posted:
                                {{ post?.date_created ? new Date(post?.date_created).toLocaleDateString() : 'Unknown date' }}
                            </p>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        
                        <NuxtLink v-if="post?.author?.avatar" :to="`/user/${post?.author?.id}`" class="postAvatar">
                            <UAvatar :image="getAssetUrl(post?.author?.avatar)" size="x-small"></UAvatar>
                        </NuxtLink>

                        <NuxtLink v-else :to="`/user/${post?.author?.id}`" class="postAvatar">
                            <UAvatar image="https://via.placeholder.com/40" size="x-small"></UAvatar>
                        </NuxtLink>
                    </v-toolbar>

                    <p v-dompurify-html="post?.content" class="postContent"></p>

                    <template>
                        <!--Reactions-->
                        <v-col class="mbr-section-btn">
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn class="btn btn-sm btn-black-outline display-4" icon="fas fa-thumbs-up"
                                        v-bind="props" variant="text" size="small"></v-btn>
                                </template>
                                <v-list>
                                    <reactions :contentId="post?.reactions?.reactions_id" :contentType="post?.type" />
                                </v-list>
                            </v-menu>
                        </v-col>

                        <!--Comments-->
                        <v-col class="mbr-section-btn">
                            <v-btn prepend-icon="fas fa-comment" title="Comment on this post" variant="text"
                                class="btn btn-sm btn-black-outline display-4"
                                :href="`/connect/post/${post?.slug}`"></v-btn>
                        </v-col>

                        <v-col class="mbr-section-btn">
                            <flag :reportId="post?.report?.report_id?.id" />
                        </v-col>

                        <!--Share-->
                        <v-col>
                            <share />
                        </v-col>
                    </template>
                </v-card>
            </div>
        </div>
    </div>
</template>

<script setup>
    import share from '#social/app/components/blocks/share.vue';
    import flag from '#social/app/components/blocks/flag.vue';
    import reactions from '#social/app/components/blocks/reactions.vue';
    import {
        toRef,
        onMounted,
        computed
    } from '#imports'
    import {
        useReactionsStore
    } from '~/stores/reactions'

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

const { getAssetUrl } = useSdkContentAdapter()
const fileNameOf = (file) => String(file?.filename_download || file?.title || file?.type || getAssetUrl(file) || '').toLowerCase()
const matchesExtension = (file, extensions) => extensions.some((ext) => fileNameOf(file).endsWith(ext))
</script>