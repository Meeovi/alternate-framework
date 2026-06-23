<template>
    <div class="meeBtn">
        <v-btn :href="meeBtn?.url" target="_blank" color="primary" class="ma-2">{{ meeBtn?.text }}</v-btn>
    </div>
</template>

<script setup>
    const { $sdk } = useNuxtApp()

    const { fetchSession } = useAuth()
    await fetchSession()

    const { data: meeBtn } = await useAsyncData('meeBtn', () => {
        return $sdk.content.readItems('mee_btn', {
            fields: ['*']
        })
    })
</script>