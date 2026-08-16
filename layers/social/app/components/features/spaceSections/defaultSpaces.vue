<template>
    <div>
        <v-col cols="12">
            <v-sheet class="mx-auto">
                <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                    <v-slide-group-item v-for="space in myDefaultSpaces" :key="space.id"
                        v-slot="{ isSelected, toggle, selectedClass }">
                        <spaceCard :space="space" :class="['ma-4', selectedClass]" v-if="isSelected" @click="toggle" />
                    </v-slide-group-item>
                </v-slide-group>
            </v-sheet>
        </v-col>

        <v-row class="member-cards">
            <v-col cols="3" v-for="space in defaultSpaces" :key="space.id" class="d-inline-block">
                <spaceCard :space="space" />
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
    import spaceCard from '../../related/space.vue'

    // globalThis.useAuth was never a real thing anywhere in this app, and
    // even if it had been, spaces.owner relates to directus_users (not
    // this app's real users — better-auth users live in a separate
    // database), and better-auth's user object has no firstName/lastName
    // fields anyway (just name) — this filter could never have matched
    // anything. user_created (Directus's own auto-tracked field) is the
    // closest real approximation, same caveat as elsewhere: accurate only
    // if spaces are ever created under each user's own Directus identity
    // rather than a single shared service token.
    const currentUser = useCurrentUser()

    const model = ref(null)
    const { $directus, $readItems } = useNuxtApp()

    const { data: myDefaultSpaces } = await useAsyncData<any[]>('myDefaultSpaces', async () => {
        if (!currentUser.value?.id) return []
        const resp = await $directus.request($readItems('spaces', { filter: { user_created: { _eq: currentUser.value.id }, space_type: { space_types_id: { name: { _eq: 'Default' } } } }, fields: ['*', { '*': ['*'] }] }))
        return resp?.data || resp || []
    })

    const { data: defaultSpaces } = await useAsyncData<any[]>('defaultSpaces', async () => {
        const resp = await $directus.request($readItems('spaces', { filter: { space_type: { space_types_id: { name: { _eq: 'Default' } } } }, fields: ['*', { '*': ['*'] }] }))
        return resp?.data || resp || []
    })
</script>
