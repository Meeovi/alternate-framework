<template>
    <div>
        <div>
            <div class="wrap feedPost">
                <v-card class="card__wrap" height="550">
                    <v-card-title class="postTitle">{{ post?.title }}</v-card-title>
                    <div class="image">
                        <div v-if="post?.file">
                            <video :src="`${$directus.url}assets/${post?.file?.filename_disk}`"></video>
                        </div>

                        <div v-else-if="post?.audio">
                            <audio :src="`${$directus.url}assets/${post?.audio?.filename_disk}`"></audio>
                        </div>

                        <div v-else-if="post?.image && post?.image?.filename_disk.endsWith('.gif')">
                            <img loading="lazy" :src="`${$directus.url}assets/${post?.image?.filename_disk}`"
                                :alt="post?.title || 'No Title'" />
                        </div>

                        <div v-else>
                            <img loading="lazy" src="assets/images/background4.jpg" :alt="post?.title || 'No Title'" />
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
                            <v-avatar :image="post?.author?.avatar" size="x-small"></v-avatar>
                        </NuxtLink>

                        <NuxtLink v-else :to="`/user/${post?.author?.id}`" class="postAvatar">
                            <v-avatar image="/images/background4.jpg" size="x-small"></v-avatar>
                        </NuxtLink>
                    </v-toolbar>

                    <p v-dompurify-html="post?.content" class="postContent"></p>

                    <v-card-actions>
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
                    </v-card-actions>
                </v-card>
            </div>
        </div>
    </div>
</template>

<script setup>
    import share from '~/components/blocks/share.vue';
    import flag from '~/components/blocks/flag.vue';
    import reactions from '~/components/blocks/reactions.vue';
    import {
        toRef,
        onMounted,
        computed
    } from 'vue'
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
</script>