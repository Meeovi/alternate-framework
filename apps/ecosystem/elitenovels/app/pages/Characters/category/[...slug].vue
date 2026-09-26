<template>
    <div>
      <PageLoader v-if="loading" />
      <div v-else>
        <v-toolbar :style="`background-color: ${category?.color};`">
            <v-toolbar-title v-if="category">{{ category?.name }}</v-toolbar-title>
        </v-toolbar>
        <v-card elevation="0">
            <div v-if="category?.name === 'Gods and Goddesses'">
                <mythologybar />
            </div>
            <div v-else-if="category?.name === 'Monsters'">
                <monsterbar />
            </div>
            <div v-else>
                <v-tabs v-model="tab" style="background-color: cadetblue; color: white;" center-active>
                    <v-tab value="one">All</v-tab>
                </v-tabs>
            </div>
            <v-card-text>
                <v-tabs-window v-model="tab">
                    <v-tabs-window-item value="one">
                        <div v-if="category?.characters?.length">
                            <v-row>
                                <v-col cols="12" sm="6" md="4" lg="3" v-for="char in category?.characters" :key="char.characters_id.id">
                                    <characters :character="char?.characters_id" />
                                </v-col>
                            </v-row>
                        </div>

                        <div v-else-if="category?.options?.length">
                            <v-row>
                                <v-col cols="12" sm="6" md="4" lg="3" v-for="facet in category?.options" :key="facet.options_id.id">
                                    <facet :facet="facet?.options_id" />
                                </v-col>
                            </v-row>
                        </div>

                        <div v-else-if="category?.stories?.length">
                            <v-col cols="12" sm="6" md="4" lg="3" v-for="story in category?.stories" :key="story.stories_id.id">
                                <storyCard :story="story?.stories_id" />
                            </v-col>
                        </div>

                        <div v-else>
                            <v-row>
                                <v-col cols="12">
                                    <p v-html="pageBlock?.description"></p>
                                </v-col>
                            </v-row>
                        </div>
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-card-text>
        </v-card>
    </div>
    </div>
</template>

<script setup>
    import PageLoader from '~/components/partials/PageLoader.vue'
    import {
        ref
    } from 'vue'
    import {
        useRoute
    } from 'vue-router'
    import characters from '~/components/related/character.vue'
    import characterbar from '~/components/menus/characterbar.vue'
    import mythologybar from '~/components/menus/mythologybar.vue'
    import monsterbar from '~/components/menus/monsterbar.vue'
    import facet from '~/components/related/facet.vue'
    import storyCard from '~/components/related/story.vue'

    const tab = ref(null)
    const route = useRoute()
    const {
        $directus,
        $readItems,
        $readItem
    } = useNuxtApp()

    // Get the specific category and its characters
    const {
        data: catData,
        status
    } = useLazyAsyncData(() => `catData-${route.params.slug}`, () => {
        return $directus.request($readItems('categories', {
            fields: [
                '*',
                'characters.characters_id.*',
                'options.options_id.*',
                'stories.stories_id.*'
            ],
            filter: {
                slug: {
                    _eq: `${route.params.slug}`
                }
            },
        }))
    })

    const {
        data: pageBlock
    } = useLazyAsyncData('pageBlock', () => {
        return $directus.request($readItem('blocks', '9', {
            fields: ['*', {
                '*': ['*']
            }],
        }))
    })

    // Get the first (and should be only) category from the result
    const category = computed(() => catData.value?.[0])
    const loading = computed(() => status.value === 'pending' && !category.value)

    useHead({
        title: computed(() => category.value?.name || 'Tag Page')
    })
</script>