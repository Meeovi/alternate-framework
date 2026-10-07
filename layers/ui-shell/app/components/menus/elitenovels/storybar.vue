<template>
    <v-card class="lowerbar" variant="text">
        <v-tabs style="background-color: goldenrod; color: black;" center-active>
            <div v-for="(menu, index) in storybar?.menus" :key="index">
            <h5>{{ storybar?.name }}</h5>
                <v-tab>
                    <a :href="menu?.url">{{ menu?.name }}</a>
                </v-tab>
            </div>
        </v-tabs>
    </v-card>
</template>

<script setup>
    const {
        $directus,
        $readItem
    } = useNuxtApp()
    const route = useRoute()

    const {
        data: storybar
    } = useLazyAsyncData('storybar', () => {
        return $directus.request($readItem('navigation', '2'))
    })
</script>