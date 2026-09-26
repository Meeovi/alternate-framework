<template>
    <v-card>
        <v-tabs bg-color="deep-blue-darken-4" fixed-tabs center-active>
            <div v-for="(menu, index) in topNavigation?.menus" :key="index">
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
        data: topNavigation
    } = useLazyAsyncData('topNavigation', () => {
        return $directus.request($readItem('navigation', '1'))
    })
</script>