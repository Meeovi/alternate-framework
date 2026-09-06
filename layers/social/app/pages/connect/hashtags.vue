<template>
    <div class="contentPage">
        <v-toolbar :style="`background-color: ${tagBar?.color}; color: ${tagBar?.colortext} !important`">
            <v-toolbar-title>
                <div class="listsToolbarTitle">
                    {{ hashtagPage?.name }}
                    <v-tooltip interactive>
                        <template v-slot:activator="{ props: activatorProps }">
                            <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                        </template>
                        <div>
                            <p class="listsToolbarTooltip" v-dompurify-html="hashtagPage?.content"></p>
                        </div>
                    </v-tooltip>
                </div>
            </v-toolbar-title>
            </v-toolbar>

        <div class="text-center">
            <div v-for="hashtag in hashtags" :key="hashtag.id" class="d-inline-block">
                <tagChip :tag="hashtag" />
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed } from '#imports'
    import TagChip from '../../components/related/tag.vue'

    const { $directus, $readItem, $readItems } = useNuxtApp()
    const tab = ref(null)

    const { data: directusHashtags } = await useAsyncData('hashtags', () => {
        return $directus.request($readItems('tags', { fields: ['*', { '*': ['*'] }] }))
    })

    // atproto's own trending topics — the atproto match for this page's
    // hashtags listing (see server/api/social/atproto/trending-hashtags.get.ts).
    // Resolves to `{ items: [] }` (never throws) if the service-account
    // atproto client isn't configured or the PDS is unreachable, so this
    // is purely additive to the Directus-backed tags above.
    const { data: atprotoHashtags } = await useAsyncData('hashtags:atprotoTrending', () => $fetch('/api/social/atproto/trending-hashtags'), { default: () => ({ items: [] }) })

    const hashtags = computed(() => [
        ...(directusHashtags.value || []),
        ...(atprotoHashtags.value?.items || []),
    ])

    const { data: hashtagPage } = await useAsyncData('hashtagPage', () => {
        return $directus.request($readItem('pages', '86', { fields: ['*', { '*': ['*'] }] }))
    })

    const { data: tagBar } = await useAsyncData('tagBar', () => {
        return $directus.request($readItem('navigation', '78', { fields: ['*', { '*': ['*'] }] }))
    })

    useHead({
        title: 'Hashtags',
    })
</script>