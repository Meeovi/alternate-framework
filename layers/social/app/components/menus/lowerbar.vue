<template>
    <v-card variant="text" class="lowerBar">
        <v-tabs v-model="tab" :bg-color="lowerbar?.color" :color="lowerbar?.colortext" align-tabs="center">
            <v-tab to="/" :style="{ color: lowerbar?.colortext || 'white' }">
                {{ lowerbar?.name || 'Home' }}
            </v-tab>
            <v-tab
                v-for="(menu, index) in lowerbarMenus"
                :key="menu?.id || menu?.slug || menu?.name || index"
                :value="menu?.value || menu?.slug || menu?.name || index"
                :href="menu?.slug || '#'"
                :style="{ color: lowerbar?.colortext || 'white' }"
            >
                {{ menu?.name || '' }}
            </v-tab>
        </v-tabs>
    </v-card>
</template>

<script setup>
    import {
        computed,
        ref
    } from '#imports'
    import useContent from '#shared/app/composables/content/useContent'

    const { readItem } = useContent()
    const tab = ref(null)

    const { data: lowerbar } = await useAsyncData('lowerbar', async () => {
        const item = await readItem('navigation', '76', {
            fields: ['*', { '*': ['*'] }],
        })
        return item || { name: 'Home', menus: [] }
    })

    const lowerbarMenus = computed(() => Array.isArray(lowerbar.value?.menus) ? lowerbar.value.menus : [])
</script>