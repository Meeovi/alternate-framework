<template>
  <v-btn variant="text" :prepend-icon="saved ? 'fas fa-check' : 'fas fa-clock'"
    :text="saved ? 'Saved for later' : 'Watch later'" :loading="saving" :disabled="saved || !shortId" @click="save" />
</template>

<script setup>
// Saves a vibe (shorts id) to the user's Watch Later list, shown on /lists.
// Guests are sent to sign in first.
const { shortId } = defineProps({
  shortId: { type: [String, Number], default: null },
})

const saved = ref(false)
const saving = ref(false)

const save = async () => {
  if (!shortId || saving.value) return
  saving.value = true
  try {
    await $fetch('/api/social/watch-later', { method: 'POST', body: { shortId } })
    saved.value = true
  } catch (err) {
    if (err?.statusCode === 401) await navigateTo(`/login?redirect=${encodeURIComponent(useRoute().fullPath)}`)
    else console.error('Failed to save for later', err)
  } finally {
    saving.value = false
  }
}
</script>
