<template>
    <v-card class="lowerbar" variant="text">
        <v-tabs v-model="tab"
            :style="`background-color: ${characterbar?.color ? characterbar.color : '#ffffff'}; color: ${characterbar?.colortext ? characterbar.colortext : '#000000'};`"
            center-active>
            <h5>{{ characterbar?.name }}</h5>
            <v-tab>
                <a style="color: black !important;" :href="`/characters/category/${characterbar?.menus?.url}`">
                    {{ characterbar?.menus?.name }}
                </a>
            </v-tab>
        </v-tabs>
    </v-card>
</template>

<script setup>
    const {
        $directus,
        $readItem
    } = useNuxtApp()
    const tab = ref(null)

    const {
        data: characterbar
    } = useLazyAsyncData('characterbar', () => {
        return $directus.request($readItem('navigation', '6'))
    })
</script>