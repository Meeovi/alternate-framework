<template>
  <div class="contentPage">
    <v-toolbar>
      <v-toolbar-title>Notifications Center</v-toolbar-title>
    </v-toolbar>

    <div v-if="!loggedOut" ref="containerEl" class="novu-inbox-page"></div>

    <v-alert v-else type="info" class="ma-5">
      Sign in to see your notifications.
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { NovuUI } from '@novu/js/ui'
import { useNovuSession } from '#shared/app/composables/notifications/useNovuSession'

// Full-page equivalent of the header bell (LayoutNotifications.vue) — same
// Novu-backed inbox, mounted as the embedded `InboxContent` component
// instead of the popover `Inbox`, since this page IS the panel rather than
// a trigger for one.
const containerEl = ref<HTMLElement | null>(null)
const loggedOut = ref(false)
let novu: InstanceType<typeof NovuUI> | null = null

onMounted(async () => {
  const session = await useNovuSession()
  if (!session) {
    loggedOut.value = true
    return
  }
  if (!containerEl.value) return

  const config = useRuntimeConfig()

  try {
    // Dynamic import — see LayoutNotifications.vue's comment on the same
    // line: a static top-level import of this Solid.js-based module
    // throws during SSR the moment it's evaluated, not just when called.
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
    novu.mountComponent({ name: 'InboxContent', props: {}, element: containerEl.value })
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
.novu-inbox-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 20px;
}
</style>
