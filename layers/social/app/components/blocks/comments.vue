<template>
  <div class="coral-thread-wrapper">
    <div v-if="showLoading" class="coral-thread-loading">
      <v-progress-circular indeterminate size="20" width="2" />
      <span>Loading comments…</span>
    </div>
    <div ref="containerRef" class="coral-thread" />
  </div>
</template>

<script setup>
// Coral (coralproject/talk), self-hosted, replaces Waline here — Waline's
// client had no extension point for external auth (its login flow talks
// only to its own server), so comments stayed logged out of the app's own
// account system. Coral supports SSO natively: server/api/social/
// coral-token.get.ts signs a JWT from the current layers/auth session, and
// that token logs the embed straight in on load (docs.coralproject.net/sso).
//
// No <ClientOnly>/hydration concerns here — the container renders as an
// empty div during SSR (Coral is JS-only either way) and only gets an id
// and content once mounted client-side, so there's nothing for hydration
// to mismatch against.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  commentId: {
    type: String,
    required: false,
    default: undefined
  }
})

// useRoute() must be called synchronously here, during setup — the actual
// storyID isn't read until inside onMounted's async callback, well after
// the awaits below, by which point Vue's injection context (what useRoute()
// relies on) is gone and it throws. Capturing the route object now and
// only reading .path from it later avoids that.
const route = useRoute()

// commentId gives each embedded thread on a page (e.g. one per card in a
// feed) its own storyID; callers that render exactly one thread per page
// (station, bookmark) fall back to the route path.
const storyID = computed(() => props.commentId ? String(props.commentId) : route.path)

const rootURL = useRuntimeConfig().public.coralServerURL
const containerRef = ref(null)
const elementId = `coral-thread-${Math.random().toString(36).slice(2)}`

// Coral's own bundle + first GraphQL round-trip against a self-hosted
// instance can take several seconds before anything paints — with nothing
// shown in the meantime this reads as "comments don't show" rather than
// "still loading". Watches for Coral actually inserting content into the
// container and only then drops the placeholder.
const showLoading = ref(true)
let observer

// embed.js attaches a single global Coral object; loading it twice throws,
// and a page can mount more than one comments.vue instance (a feed of
// shorts, each with its own thread), so the script load itself is shared
// and awaited by every instance rather than fetched per-instance.
function loadEmbedScript() {
  if (window.Coral) return Promise.resolve()
  if (!window.__coralEmbedLoading) {
    window.__coralEmbedLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `${rootURL}/assets/js/embed.js`
      script.async = false
      script.defer = true
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  return window.__coralEmbedLoading
}

onMounted(async () => {
  if (!rootURL || !containerRef.value) {
    // Nothing to load (Coral not configured) — don't leave the spinner up.
    showLoading.value = false
    return
  }

  observer = new MutationObserver(() => {
    if (containerRef.value?.childElementCount) {
      showLoading.value = false
      observer.disconnect()
    }
  })
  observer.observe(containerRef.value, { childList: true })

  containerRef.value.id = elementId

  // A signed-out visitor still gets a usable (logged-out) embed — Coral's
  // own "Allow Registration" setting covers sign-up from inside the widget.
  const { token } = await $fetch('/api/social/coral-token').catch(() => ({ token: null }))

  await loadEmbedScript()

  window.Coral.createStreamEmbed({
    id: elementId,
    rootURL,
    storyID: storyID.value,
    storyURL: window.location.href,
    autoRender: true,
    accessToken: token || undefined,
  })
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.coral-thread-wrapper {
  position: relative;
  min-height: 200px;
}

.coral-thread-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.9rem;
}

.coral-thread {
  min-height: 200px;
}
</style>
