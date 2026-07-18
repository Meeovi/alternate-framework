<template>
  <v-avatar v-if="avatarUrl" :src="avatarUrl" alt="User avatar" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const { onLoaded } = useScriptGravatar()

const props = defineProps<{
  email: string
  size?: number
  hash?: string
  rating?: string
  hovercards?: boolean
  default?: string
}>()

const avatarUrl = ref('')

onLoaded((api: { getAvatarUrlFromEmail: (arg0: string, arg1: { size: number; rating?: string; d?: string; hash?: string; }) => string; }) => {
  avatarUrl.value = api.getAvatarUrlFromEmail(props.email, { size: props.size ?? 120, rating: props.rating, d: props.default, hash: props.hash })
})
</script>