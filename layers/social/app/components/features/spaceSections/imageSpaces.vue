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

    const runtimeUseAuth = (globalThis as any).useAuth as (() => any) | undefined
    const { user } = runtimeUseAuth
        ? runtimeUseAuth()
        : { user: useState<any>('social:user', () => null) }
    const currentFirstName = computed(() => (user.value as any)?.firstName || (user.value as any)?.first_name || '')
    const currentLastName = computed(() => (user.value as any)?.lastName || (user.value as any)?.last_name || '')

    const model = ref(null)
    const { $readItems } = useNuxtApp()

    const { data: myImageSpaces } = await useAsyncData<any[]>('myImageSpaces', async () => {
        const resp = await readItems('spaces', { filter: { owner: { first_name: { _eq: currentFirstName.value }, last_name: { _eq: currentLastName.value } }, space_type: { space_types_id: { name: { _eq: 'Images' } } } }, fields: ['*', { '*': ['*'] }] })
        return resp?.data || resp || []
    })

    const { data: imageSpaces } = await useAsyncData<any[]>('imageSpaces', async () => {
        const resp = await readItems('spaces', { filter: { space_type: { space_types_id: { name: { _eq: 'Images' } } } }, fields: ['*', { '*': ['*'] }] })
        return resp?.data || resp || []
    })
</script>
