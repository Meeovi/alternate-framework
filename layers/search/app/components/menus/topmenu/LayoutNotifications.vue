<template>
  <!-- Zero-size placeholder that stays in the header's normal flex flow,
       purely so the layout doesn't shift — the actual widget is teleported
       out (see script comment below) and positioned to match this spot. -->
  <div ref="anchorEl" class="novu-inbox-anchor"></div>

  <Teleport to="body">
    <div ref="containerEl" class="novu-inbox-container" :style="positionStyle"></div>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue'
import type { NovuUI } from '@novu/js/ui'
import { useNovuSession } from '#shared/app/composables/notifications/useNovuSession'
// Required for the widget to render styled at all (sizing, colors, the
// popover's positioning) — see layers/shared/nuxt.config.ts's novuCssPath
// comment for why this needs a resolve.alias rather than working as a
// plain package import. A CSS import (unlike the JS import above) has no
// SSR-crash risk — it's just a side-effect style injection either way.
import '@novu/js/dist/index.css'

// Replaces the old custom bell/drawer + `notifications` Directus collection
// (useUserNotifications.ts) with Novu's self-contained Inbox widget.
//
// Teleported to <body> rather than mounted in place: Novu's popover always
// portals *within its own root element* (confirmed by reading
// @novu/js/dist/esm/ui/index.mjs — PopoverContent's mount target is
// `closestNovuRootParent`, walking up to the nearest `#novu-root-<id>`
// ancestor, with no config option to redirect it elsewhere). That root
// lives wherever mountComponent() targets — here, inside Header.vue's
// v-toolbar. Vuetify's `.v-toolbar__content` sets `overflow: hidden`
// (for its own collapse/scroll animations), which clips ANY
// absolutely-positioned descendant that overflows it, popover included —
// same class of bug as this codebase's existing v-navigation-drawer-in-
// v-app-bar clipping issue, fixed the same established way: Teleport to
// body, then pin the teleported element's position to a same-spot anchor
// left behind in the real header flow (confirmed live 2026-09-16 — without
// this the popover rendered with correct size/position/background per its
// own computed styles, but was invisibly clipped to the toolbar's height).
const anchorEl = ref<HTMLElement | null>(null)
const containerEl = ref<HTMLElement | null>(null)
const positionStyle = ref<Record<string, string>>({ position: 'fixed', visibility: 'hidden' })
let novu: InstanceType<typeof NovuUI> | null = null

function syncPosition() {
  if (!anchorEl.value) return
  const rect = anchorEl.value.getBoundingClientRect()
  positionStyle.value = {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: '1020', // above Vuetify's v-toolbar (1010, observed live)
  }
}

onMounted(async () => {
  syncPosition()
  window.addEventListener('resize', syncPosition)

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

onUnmounted(() => {
  window.removeEventListener('resize', syncPosition)
})

onBeforeUnmount(() => {
  if (novu && containerEl.value) {
    novu.unmountComponent(containerEl.value)
  }
})
</script>

<style scoped>
.novu-inbox-anchor {
  width: 36px;
  height: 36px;
}
</style>
