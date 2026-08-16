<template>
    <div>
        <v-col cols="12">
            <v-sheet class="mx-auto">
                <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                    <v-slide-group-item v-for="space in myImageSpaces" :key="space.id"
                        v-slot="{ isSelected, toggle, selectedClass }">
                        <spaceCard :space="space" :class="['ma-4', selectedClass]" v-if="isSelected" @click="toggle" />
                    </v-slide-group-item>
                </v-slide-group>
            </v-sheet>
        </v-col>

        <v-row class="member-cards">
            <v-col cols="3" v-for="space in imageSpaces" :key="space.id" class="d-inline-block">
                <spaceCard :space="space" />
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
    import spaceCard from '../../related/space.vue'

    // See defaultSpaces.vue for why: globalThis.useAuth was never real,
    // and owner/name-based filtering could never have matched real
    // better-auth users. user_created is the closest real approximation.
    const currentUser = useCurrentUser()

    const model = ref(null)
    const { $directus, $readItems } = useNuxtApp()

    const { data: myImageSpaces } = await useAsyncData<any[]>('myImageSpaces', async () => {
        if (!currentUser.value?.id) return []
        const resp = await $directus.request($readItems('spaces', { filter: { user_created: { _eq: currentUser.value.id }, space_type: { space_types_id: { name: { _eq: 'Images' } } } }, fields: ['*', { '*': ['*'] }] }))
        return resp?.data || resp || []
    })

    const { data: imageSpaces } = await useAsyncData<any[]>('imageSpaces', async () => {
        const resp = await $directus.request($readItems('spaces', { filter: { space_type: { space_types_id: { name: { _eq: 'Images' } } } }, fields: ['*', { '*': ['*'] }] }))
        return resp?.data || resp || []
    })
</script>
