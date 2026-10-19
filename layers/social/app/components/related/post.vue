<template>
    <div>
        <div class="wrap feedPost">
            <v-card class="card__wrap" height="550">
                <div class="cardWrapper">
                    <v-toolbar color="transparent" flat>
                        <v-toolbar-title>
                            <v-list style="position: relative; left: -16px;">
                                <v-list-item :title="post?.author?.name"
                                    :prepend-avatar="getAssetURL(post?.author?.avatar)">
                                    <template #subtitle>
                                        <TimeAgo v-if="post?.date_created" :time="post.date_created" :label="null"
                                            size="small" />
                                        <span v-else>Unknown date</span>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-toolbar-title>


                        <editMenu :post="post" />
                    </v-toolbar>

                    <div class="align-end text-white" max-height="200px" v-if="post?.file_url || post?.file">
                        <MeeoviPlayer :src="getAssetURL(post?.file_url || post?.file)" :title="post?.title" />
                    </div>

                    <div class="align-end text-white" max-height="200px" v-else-if="post?.audio_url || post?.audio">
                        <MeeoviPlayer kind="audio" :src="getAssetURL(post?.audio_url || post?.audio)"
                            :title="post?.title" />
                    </div>

                    <div class="align-end text-white" max-height="200px" v-else-if="post?.image_url || post?.image">
                        <NuxtImg provider="cloudinary" loading="lazy" :src="getAssetURL(post?.image_url || post?.image)"
                            :alt="post?.title || 'No Title'" />
                    </div>
                    <NuxtImg v-else class="align-end text-white" max-height="200px"
                        src="https://cdn.vuetifyjs.com/images/cards/docks.jpg" :alt="post?.title || 'No Title'" cover />

                    <v-card-title>{{ post?.title }}</v-card-title>

                    <v-card-text>
                        <p v-dompurify-html="post?.content" class="postContent"></p>
                    </v-card-text>

                    <v-card-actions>
                        <!--Rating (rate on the post page)-->
                        <MeeoviRating v-if="post?.id" type="post" :id="post.id" summary />

                        <!--Comments-->
                        <v-btn variant="text" class="mbr-section-btn">
                            <v-btn prepend-icon="fas fa-comment" title="Comment on this post" text="Comment"
                                variant="text" :to="noteLink" :disabled="!noteLink"></v-btn>
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
    import {
        getAssetURL
    } from '#shared/app/utils/get-asset-url'
    import editMenu from '#social/app/components/blocks/postEditMenu.vue';
    import share from '#social/app/components/blocks/share.vue';
    //import repost from '#social/app/components/blocks/repost/repost.vue';
    import TimeAgo from '#social/app/components/blocks/useTimeAgo.vue';
    import { postPath } from '#social/app/utils/postPath';
    import {
        computed,
        toRef
    } from '#imports'

    const {
        $sdk
    } = useNuxtApp()

    const props = defineProps({
        post: {
            type: Object,
            required: true,
        },
    });
    const post = toRef(props, 'post');
    // The post's page (slug, or id for posts saved without one).
    const noteLink = computed(() => postPath(post.value));

    const fileNameOf = (file) => String(file?.filename_download || file?.title || file?.type || getAssetURL(
            file) || '')
        .toLowerCase()
    const matchesExtension = (file, extensions) => extensions.some((ext) => fileNameOf(file).endsWith(ext))
</script>

<style scoped>
    .card__wrap {
        max-width: 300px;
    }

    .align-end {
        min-height: 200px;
        max-height: 200px;
    }

    .cardWrapper img {
        max-height: 200px;
    }
</style>