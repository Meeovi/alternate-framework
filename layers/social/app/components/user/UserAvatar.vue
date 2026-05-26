<template>
    <div>
        <v-avatar size="40" :image="userAvatar" />
    </div>
</template>

<script setup>
    import { computed } from 'vue'

    const auth = useAuth()
    const user = auth.user
    const userAvatar = computed(() => user.value?.image || user.value?.avatar || '')
</script>