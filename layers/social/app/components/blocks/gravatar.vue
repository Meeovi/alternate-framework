<template>
  <NuxtImg provider="ipx" v-if="avatarUrl" :src="avatarUrl" alt="User avatar" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useScriptGravatar } from '#imports'

const { onLoaded } = useScriptGravatar()

const avatarUrl = ref('')

onLoaded((api: { getAvatarUrlFromEmail: (email: string, options?: { size?: number }) => string }) => {
  avatarUrl.value = api.getAvatarUrlFromEmail('user@example.com', { size: 120 })
})
</script>