<template>
  <div ref="containerEl" class="novu-inbox-container"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { NovuUI } from '@novu/js/ui'
import { useNovuSession } from '#shared/app/composables/notifications/useNovuSession'

// Replaces the old custom bell/drawer + `notifications` Directus collection
// (useUserNotifications.ts) with Novu's self-contained Inbox widget — it
// renders its own bell trigger and popover panel into this one element, so
// there's no v-badge/v-navigation-drawer to maintain here anymore.
const containerEl = ref<HTMLElement | null>(null)
let novu: InstanceType<typeof NovuUI> | null = null

onMounted(async () => {
  const session = await useNovuSession()
  // Logged-out visitor (session.get.ts 401s via requireAuth), or the
  // fetch/mount failed — leave the container empty rather than showing a
  // bell that does nothing.
  if (!session || !containerEl.value) return

  const config = useRuntimeConfig()

  try {
    // Dynamic, not a top-level `import ... from '@novu/js/ui'` — that
    // module is Solid.js-based and throws "Client-only API called on the
    // server side" the moment it's even IMPORTED during SSR (confirmed
    // live 2026-09-16 — took the whole app down with a 500, since this
    // component is in the header on every page). onMounted only ever runs
    // client-side, so a dynamic import here is never requested by SSR at
    // all — same fix pattern as adapter-magento's node:crypto import
    // earlier this session.
    const { NovuUI } = await import('@novu/js/ui')
    novu = new NovuUI({
      options: {
        applicationIdentifier: session.applicationIdentifier,
        subscriber: session.subscriberId,
        subscriberHash: session.subscriberHash,
        apiUrl: (config.public as { novuBackendUrl?: string }).novuBackendUrl,
        socketUrl: (config.public as { novuSocketUrl?: string }).novuSocketUrl,
      },
    })
    novu.mountComponent({ name: 'Inbox', props: {}, element: containerEl.value })
  } catch (error) {
    console.error('[notifications] failed to mount Novu inbox', error)
  }
})

onBeforeUnmount(() => {
  if (novu && containerEl.value) {
    novu.unmountComponent(containerEl.value)
  }
})
</script>

<style scoped>
.novu-inbox-container {
  display: flex;
  align-items: center;
}
</style>