<template>
  <div v-if="state?.connected" class="bluesky-crosspost">
    <v-switch
      :model-value="state.enabled"
      color="primary"
      inset
      hide-details
      :loading="saving"
      :disabled="saving"
      :label="`Also post my public notes to Bluesky (@${state.handle})`"
      @update:model-value="save(!!$event)"
    />
    <p class="text-caption text-medium-emphasis mt-1">
      Notes you post publicly on Meeovi from now on are also posted from your Bluesky account, with a link back to
      Meeovi, and appear in the Meeovi feed on Bluesky. Deleting or hiding a note on Meeovi deletes it from Bluesky too.
      Notes you wrote before turning this on aren't posted.
    </p>
    <p v-if="error" class="text-caption text-error mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

/**
 * "Also post my public notes to Bluesky" (layers/social
 * server/utils/crosspost.ts): shown once the member has connected Bluesky.
 */
type State = { connected: boolean, handle: string | null, enabled: boolean, since: string | null }

const state = ref<State | null>(null)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  state.value = await $fetch<State>('/api/social/atproto/crosspost').catch(() => null)
})

async function save(enabled: boolean) {
  error.value = ''
  saving.value = true
  try {
    state.value = await $fetch<State>('/api/social/atproto/crosspost', { method: 'PUT', body: { enabled } })
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.data?.message || "That didn't save. Please try again."
  } finally {
    saving.value = false
  }
}
</script>
