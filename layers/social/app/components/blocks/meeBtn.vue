<template>
    <div class="meeBtn">
        <v-btn :href="meeBtn?.url" target="_blank" color="primary" class="ma-2">{{ meeBtn?.text }}</v-btn>
    </div>
</template>

<script setup>
    import useContent from '#shared/app/composables/content/useContent'
    const content = useContent()

    const { fetchSession } = useAuth()
    await fetchSession()

    const { data: meeBtn } = await useAsyncData('meeBtn', () => {
        return content.readItems('mee_btn', {
            fields: ['*', {
                '*': ['*']
            }]
        })
    })
</script>