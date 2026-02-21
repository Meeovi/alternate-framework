<template>
    <UCard variant="text" class="lowerBar">
        <v-tabs v-model="tab" :bg-color="lowerbar?.color" :color="lowerbar?.colortext" align-tabs="center">
            <v-tab><NuxtLink style="color: white;" to="/">{{ lowerbar?.name }}</NuxtLink></v-tab>
            <div v-for="(menu, index) in lowerbar?.menus" :key="index">
                <v-tab :value="menu?.value">
                    <UButton variant="text" :style="`color: ${lowerbar?.colortext} !important`"
                        :href="menu?.slug">{{ menu?.name }}</UButton>
                </v-tab>
            </div>
        </v-tabs>
    </UCard>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import useDirectusRequest from '~/composables/useDirectusRequest'

    const { readItem } = useDirectusRequest()
    const tab = ref(null);
    
    const { data: lowerbar } = await useAsyncData('lowerbar', () => {
        return readItem('navigation', '76', {
            fields: ['*', { '*': ['*'] }]
        })
    })
</script>