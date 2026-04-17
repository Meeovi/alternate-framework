<template>
    <div class="meeBtn">
        <v-btn :href="meeBtn?.url" target="_blank" color="primary" class="ma-2">{{ meeBtn?.text }}</v-btn>
    </div>
</template>

<script setup>
    const { $dataClient, $readItems } = useNuxtApp()

    const { fetchSession } = useAuth()
    await fetchSession()

    const { data: meeBtn } = await useAsyncData('meeBtn', () => {
        return $dataClient.request($readItems('mee_btn', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })
</script>