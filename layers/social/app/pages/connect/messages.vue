<template>
    <div class="contentPage">
        <v-toolbar :style="`background-color: ${collabBar?.color}; color: ${collabBar?.colortext} !important`">
            <v-toolbar-title>
                <div class="listsToolbarTitle">
                    {{ collabBar?.name }}
                    <v-tooltip interactive>
                        <template v-slot:activator="{ props: activatorProps }">
                            <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                        </template>
                        <div>
                            <p class="listsToolbarTooltip" v-dompurify-html="collabBar?.description"></p>
                        </div>
                    </v-tooltip>
                </div>
            </v-toolbar-title>
        </v-toolbar>

        <!-- Private messages between members (Rocket.Chat direct messages,
             signed in with the Meeovi session) — @mframework/meeovi-discussions. -->
        <div class="pa-3">
            <MeeoviMessages />
        </div>
    </div>
</template>

<script setup>
    const { $directus, $readItem } = useNuxtApp()

    const { data: collabBar } = await useAsyncData('collabBar', () => {
        return $directus.request($readItem('navigation', '113', { fields: ['*', { '*': ['*'] }] }))
    })

useHead({
    title: 'Collaborrate - Messages',
    meta: [
        {
            name: 'description',
            content: 'Messages'
        }
    ]
})
</script>