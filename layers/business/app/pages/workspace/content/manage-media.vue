<template>
    <div class="contentPage">
        <v-toolbar :style="`background-color: ${mediabar?.color}; color: ${mediabar?.colortext} !important`">
            <v-toolbar-title>
                <div class="listsToolbarTitle">
                    {{ mediabar?.name }}
                    <v-tooltip interactive>
                        <template v-slot:activator="{ props: activatorProps }">
                            <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                        </template>
                        <div>
                            <p class="listsToolbarTooltip" v-dompurify-html="mediabar?.description"></p>
                        </div>
                    </v-tooltip>
                </div>
            </v-toolbar-title>
        </v-toolbar>
        
        <!-- Media library (images, videos, and documents) — @mframework/meeovi-media. -->
    </div>
</template>

<script setup>
    const { $directus, $readItem } = useNuxtApp()

    const { data: mediabar } = await useAsyncData('mediabar', () => {
        return $directus.request($readItem('navigation', '137', { fields: ['*', { '*': ['*'] }] }))
    })

useHead({
    title: 'Pixanomy - Media',
    meta: [
        {
            name: 'description',
            content: 'Media library'
        }
    ]
})
</script>