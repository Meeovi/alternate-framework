<template>
    <div>
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
    import { ref } from '#imports'
    import TagChip from '../../components/related/tag.vue'

    const { $directus, $readItems, $readItem } = useNuxtApp()
    const tab = ref(null)

    const { data: hashtags } = await useAsyncData('hashtags', () => {
        return $directus.request($readItems('tags', { fields: ['*', { '*': ['*'] }] }))
    })

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