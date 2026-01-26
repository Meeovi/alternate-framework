<template>
    <div>
        <section data-bs-version="5.1" class="header3 cid-v0mS4gj9NP" id="header3-e">
            <div>
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="right-side col-12 col-md-5 item-wrapper">
                            <div v-if="tag?.image?.filename_disk">
                                <img :alt="tag?.name" :src="`${$directus.url}assets/${tag?.image?.filename_disk}`"
                                    cover />
                            </div>

                            <div v-else><img src="../../../assets/images/backgraund-trend.jpg" :alt="tag?.name"></div>
                        </div>
                        <div class="left-side col-12 col-md">
                            <h3 class="mbr-section-title mbr-fonts-style l1 display-5">{{ tag?.name }}
                            </h3>
                            <div class="line"></div>
                            <h3 class="mbr-section-subtitle mbr-fonts-style l2 display-4">
                                <NuxtLink to="/" class="text-success">Home</NuxtLink>
                                &nbsp;/
                                <NuxtLink to="/hashtags" class="text-success">Hashtags</NuxtLink>&nbsp;/ {{ tag?.name }}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <v-col cols="12" v-if="tag?.posts?.length">
            <v-toolbar density="comfortable" color="transparent">
                <v-toolbar-title>NOTES WITH THIS #HASHTAG</v-toolbar-title>
            </v-toolbar>
            <v-sheet class="mx-auto">
                <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                    <v-slide-group-item v-for="post in tag?.posts" :key="post"
                        v-slot="{ isSelected, toggle, selectedClass }">
                        <postCard :post="post?.posts_id" :class="['ma-4', selectedClass]" v-if="isSelected"
                            @click="toggle" />
                    </v-slide-group-item>
                </v-slide-group>
            </v-sheet>
        </v-col>

        <v-col cols="12" v-else-if="tag?.spaces?.length">
            <v-toolbar density="comfortable" color="transparent">
                <v-toolbar-title>SPACES WITH THIS #HASHTAG</v-toolbar-title>
            </v-toolbar>
            <v-sheet class="mx-auto">
                <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                    <v-slide-group-item v-for="space in tag?.spaces" :key="space.id" :value="space"
                        v-slot="{ isSelected, toggle, selectedClass }">
                        <spaceCard :space="space?.spaces_id" :class="['ma-4', selectedClass]" v-if="isSelected"
                            @click="toggle" />
                    </v-slide-group-item>
                </v-slide-group>
            </v-sheet>
        </v-col>

        <v-col cols="12" v-else-if="tag?.shorts?.length">
            <v-toolbar density="comfortable" color="transparent">
                <v-toolbar-title>SHORTS WITH THIS #HASHTAG</v-toolbar-title>
            </v-toolbar>
            <v-sheet class="mx-auto">
                <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                    <v-slide-group-item v-for="short in tag?.shorts" :key="short.id" :value="short"
                        v-slot="{ isSelected, toggle, selectedClass }">
                        <shortsCard :short="short?.spaces_id" :class="['ma-4', selectedClass]" v-if="isSelected"
                            @click="toggle" />
                    </v-slide-group-item>
                </v-slide-group>
            </v-sheet>
        </v-col>

        <v-col v-else cols="12" class="text-center"><h2>No content with the hashtag <b>#{{ tag?.name }}</b></h2></v-col>
    </div>
</template>

<script setup>
    //import Hashtags from '~/components/features/hashtags.vue'
    import postCard from '~/components/related/post.vue'
    import spaceCard from '~/components/related/space.vue'
    import shortsCard from '~/components/related/short.vue'

    const {
        $directus,
        $readItems
    } = useNuxtApp()
    const route = useRoute()

    const {
        data: tag
    } = await useAsyncData('tag', () => {
        return $directus.request($readItems('tags', {
            filter: {
                slug: {
                    _eq: `${route.params.slug}`
                }
            },
            fields: ['*', {
                '*': ['*']
            }],
            limit: 1
        })).then(response => response?.[0]) // Get first item from response
    })

    useHead({
        title: computed(() => tag.value?.name || 'Tag Page')
    });
</script>