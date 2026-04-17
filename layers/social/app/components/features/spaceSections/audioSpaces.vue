<template>
    <div>
        <v-col cols="12">
            <v-sheet class="mx-auto">
                <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                    <v-slide-group-item v-for="space in myAudioSpaces" :key="space.id"
                        v-slot="{ isSelected, toggle, selectedClass }">
                        <spaceCard :space="space" :class="['ma-4', selectedClass]" v-if="isSelected" @click="toggle" />
                    </v-slide-group-item>
                </v-slide-group>
            </v-sheet>
        </v-col>

        <v-row class="member-cards">
            <v-col cols="3" v-for="space in audioSpaces" :key="space.id" class="d-inline-block">
                <spaceCard :space="space" />
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
    import spaceCard from '#social/app/components/related/space.vue'
    const currentUser = useCurrentUser()
    const currentFirstName = computed(() => (currentUser.value as any)?.firstName || (currentUser.value as any)?.first_name || '')
    const currentLastName = computed(() => (currentUser.value as any)?.lastName || (currentUser.value as any)?.last_name || '')

    const model = ref(null)
    import useAdapterRequest from '#social/app/composables/core/useAdapterRequest'
    const { readItems } = useAdapterRequest()

    const { data: myAudioSpaces } = await useAsyncData('myAudioSpaces', async () => {
        const resp = await readItems('spaces', { filter: { owner: { first_name: { _eq: currentFirstName.value }, last_name: { _eq: currentLastName.value } }, space_type: { space_types_id: { name: { _eq: 'Audio' } } } }, fields: ['*', { '*': ['*'] }] })
        return resp?.data || resp || []
    })

    const { data: audioSpaces } = await useAsyncData('audioSpaces', async () => {
        const resp = await readItems('spaces', { filter: { space_type: { space_types_id: { name: { _eq: 'Audio' } } } }, fields: ['*', { '*': ['*'] }] })
        return resp?.data || resp || []
    })
</script>