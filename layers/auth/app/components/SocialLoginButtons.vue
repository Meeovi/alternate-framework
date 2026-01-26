<script setup lang="ts">
import type { OAuthProvider } from '@meeovi/auth'

defineProps<{
  providers: OAuthProvider[]
}>()

const emit = defineEmits<{
  select: [OAuthProvider]
}>()
</script>

<template>
  <div>
    <v-btn variant="outlined"
      v-for="provider in providers"
      :key="provider.id"
      @click="emit('select', provider)"
    >
      Continue with {{ provider.name }}
    </v-btn>
  </div>
</template>
