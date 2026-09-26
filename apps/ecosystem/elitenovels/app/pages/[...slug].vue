<template>
    <div>
      <PageLoader v-if="loading" />
      <div v-else class="contentPage">
        <section data-bs-version="5.1" class="header01 emblemm5 cid-uLEdfj7dI6" id="header01-1k">
            <div v-if="page?.image?.length" class="mbr-fallback-image"
                :style="`background-image: url(${$directus.url}assets/${page?.image?.filename_disk}) !important`"></div>

            <div v-else-if="page?.name === 'Characters'" class="mbr-fallback-image"
                style="background-image: url(/images/thelazaronbanner-900x357.png) !important"></div>

            <div v-else-if="page?.name === 'Mythology'" class="mbr-fallback-image"
                style="background-image: url(/images/mbr-1920x1920.jpg) !important"></div>

            <div v-else-if="page?.name === 'Dictionary'" class="mbr-fallback-image"
                style="background-image: url(/images/mbr-1-700x467.jpg) !important"></div>

            <div v-else-if="page?.name === 'Monsters'" class="mbr-fallback-image"
                style="background-image: url(/images/mbr-1080x763.jpg) !important"></div>

            <div v-else-if="page?.name === 'Items'" class="mbr-fallback-image"
                style="background-image: url(/images/mbr-1920x1368.jpg) !important"></div>

            <div v-else-if="page?.name === 'Places'" class="mbr-fallback-image"
                style="background-image: url(/images/mbr-510x383.jpg) !important"></div>

            <div v-else-if="page?.name === 'Abilities'" class="mbr-fallback-image"
                style="background-image: url(/images/mbr-700x514.jpg) !important"></div>

            <div v-else-if="page?.name === 'Levels'" class="mbr-fallback-image"
                style="background-image: url(/images/mbr-1-510x340.jpg) !important"></div>

            <div v-else-if="page?.name === 'Types'" class="mbr-fallback-image"
                style="background-image: url(/images/mbr-1460x973.jpg) !important"></div>

            <div v-else-if="page?.name === 'Kids'" class="mbr-fallback-image"
                style="background-image: url(/images/mbr-1-676x676.jpg) !important"></div>

            <div v-else-if="page?.name === 'Stories'" class="mbr-fallback-image"
                style="background-image: url(/images/mbr-1460x821.jpg) !important"></div>

            <div v-else-if="page?.name === 'Videos'" class="mbr-fallback-image"
                style="background-image: url(/images/mbr-3-510x340.jpg) !important"></div>

            <div v-else-if="page?.name === 'Games'" class="mbr-fallback-image"
                style="background-image: url(/images/mbr-1920x1400.jpg) !important"></div>

            <div class="container-fluid">
                <div class="row">
                    <div class="col-12 col-lg-12">
                        <div class="content-wrapper">
                            <h2 class="mbr-section-title mbr-fonts-style display-1">
                                <strong>{{ page?.name }}</strong>
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div v-if="page?.name === 'Mythology'">
            <mythologyPage />
        </div>

        <div v-if="page?.name === 'Dictionary'">
            <dictionaryPage />
        </div>

        <div v-if="page?.name === 'Monsters'">
            <monsterPage />
        </div>

        <div v-if="page?.name === 'Items'">
            <itemPage />
        </div>

        <div v-if="page?.name === 'Places'">
            <placePage />
        </div>

        <div v-if="page?.name === 'Abilities'">
            <abilityPage />
        </div>

        <div v-if="page?.name === 'Levels'">
            <levelPage />
        </div>

        <div v-if="page?.name === 'Types'">
            <typePage />
        </div>

        <div v-if="page?.name === 'Kids'">
            <kidsPage />
        </div>

        <v-row v-if="page?.name === 'Stories'" class="ma-0">
            <v-col cols="12" sm="6" lg="4" v-for="story in stories" :key="story.id">
                <storyComponent :story="story" />
            </v-col>
        </v-row>

        <v-row v-if="page?.name === 'Videos'" class="ma-0">
            <v-col cols="12" sm="6" lg="4" v-for="video in videos" :key="video.id">
                <videoComponent :video="video" />
            </v-col>
        </v-row>

        <v-row v-if="page?.name === 'Kids'" class="ma-0">
            <v-col cols="12" sm="6" md="4" lg="3" v-for="kid in kidCharacters" :key="kid.id">
                <characterComponent :character="kid" />
            </v-col>
        </v-row>

        <div v-else>
            <v-toolbar v-if="page?.description"
                title="DESCRIPTION" density="comfortable" color="transparent"></v-toolbar>

            <p class="pageDescription mbr-text mbr-fonts-style display-4" v-html="page?.content"></p>
        </div>
    </div>
    </div>
</template>

<script setup>
    import PageLoader from '~/components/partials/PageLoader.vue'
    import {
        ref
    } from 'vue'
    import mythologyPage from '~/components/pages/mythology.vue'
    import monsterPage from '~/components/pages/monsters.vue'
    import itemPage from '~/components/pages/items.vue'
    import placePage from '~/components/pages/places.vue'
    import dictionaryPage from '~/components/pages/dictionary.vue'
    import abilityPage from '~/components/pages/abilities.vue'
    import levelPage from '~/components/pages/levels.vue'
    import kidsPage from '~/components/pages/kids.vue'
    import typePage from '~/components/pages/types.vue'
    import storyComponent from '~/components/related/story.vue'
    import videoComponent from '~/components/related/video.vue'
    import characterComponent from '~/components/related/character.vue'

    const route = useRoute();
    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const slug = computed(() => Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug)

    // One request chain per page: fetch the page, then only the extra collection
    // that this particular page renders (Stories / Videos / Kids).
    const {
        data,
        status
    } = useLazyAsyncData(() => `page-${slug.value}`, async () => {
        const page = (await $directus.request($readItems('pages', {
            fields: ['*', 'image.*'],
            filter: {
                slug: {
                    _eq: slug.value
                }
            },
            limit: 1
        })))?.[0] || null

        const result = { page, stories: [], videos: [], kidCharacters: [] }

        if (page?.name === 'Stories') {
            result.stories = await $directus.request($readItems('stories', {
                fields: ['*', {
                    '*': ['*']
                }]
            }))
        } else if (page?.name === 'Videos') {
            result.videos = await $directus.request($readItems('videos', {
                fields: ['*', {
                    'videos': ['*']
                }]
            }))
        } else if (page?.name === 'Kids') {
            result.kidCharacters = await $directus.request($readItems('characters', {
                fields: ['*', {
                    '*': ['*']
                }],
                filter: {
                    universe: {
                        universe_id: {
                            name: {
                                _eq: 'Kids'
                            }
                        }
                    }
                }
            }))
        }

        return result
    })

    const page = computed(() => data.value?.page)
    const loading = computed(() => status.value === 'pending' && !page.value)
    const stories = computed(() => data.value?.stories || [])
    const videos = computed(() => data.value?.videos || [])
    const kidCharacters = computed(() => data.value?.kidCharacters || [])

    useHead({
        title: computed(() => page?.value?.name || 'Page Name')
    })
</script>