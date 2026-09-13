<template>
  <!-- The Coral embed is browser-only: it injects a <script> and mounts an
       iframe imperatively, and none of it can (or should) run during SSR.
       <ClientOnly> keeps the whole widget off the server render so there's
       nothing to hydrate and no server work spent on a JS-only embed. -->
  <ClientOnly>
    <div class="coral-thread-wrapper">
      <div v-if="showLoading" class="coral-thread-loading">
        <v-progress-circular indeterminate size="20" width="2" />
        <span>Loading comments…</span>
      </div>
      <div ref="containerRef" class="coral-thread" />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
// Coral (coralproject/talk), self-hosted, replaces Waline here — Waline's
// client had no extension point for external auth (its login flow talks
// only to its own server), so comments stayed logged out of the app's own
// account system. Coral supports SSO natively: server/api/social/
// coral-token.get.ts signs a JWT from the current layers/auth session, and
// that token logs the embed straight in on load (docs.coralproject.net/sso).
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// embed.js (loaded at runtime from the Coral server) attaches these to
// window — declare them so the imperative calls below type-check.
interface CoralStreamEmbedOptions {
  id: string
  rootURL: string
  storyID?: string
  storyURL?: string
  autoRender?: boolean
  accessToken?: string
}
declare global {
  interface Window {
    Coral?: {
      createStreamEmbed: (options: CoralStreamEmbedOptions) => unknown
    }
    __coralEmbedLoading?: Promise<void>
  }
}

const props = defineProps<{
  /**
   * Gives each embedded thread on a page (e.g. one per card in a feed) its
   * own storyID. Callers that render exactly one thread per page (station,
   * bookmark) omit it and fall back to the route path.
   */
  commentId?: string
  /**
   * Optional canonical page URL for this thread. When omitted it's derived
   * from the storyID (see storyURL below). Pass it when the thread has a
   * real permalink so Coral can scrape a title/image for the moderation UI.
   */
  storyUrl?: string
}>()

// useRoute() must be called synchronously here, during setup — the actual
// key isn't read until inside onMounted's async callback, well after the
// awaits below, by which point Vue's injection context (what useRoute()
// relies on) is gone and it throws. Capturing the route object now and
// only reading .path from it later avoids that.
const route = useRoute()

// Identifies the thread. Only used to derive the canonical URL below —
// deliberately NOT sent to Coral as a storyID (see storyURL).
const storyKey = computed(() => (props.commentId ? String(props.commentId) : route.path))

// We hand Coral a storyURL and no storyID. Coral keys a story by URL and,
// with no id supplied, generates its own — so the id-collision path that
// throws DUPLICATE_STORY_ID (Coral trying to insert a second story row for
// an id it already has, because the same storyID arrived with a different
// storyURL) simply can't happen. That error was showing because earlier
// builds sent a fixed storyID together with window.location.href, which
// varies: this widget routinely renders inside a popup opened over any
// page. The catch is that the URL must now itself be stable per thread, so
// resolve it as a pure function of storyKey and never from the live
// location: an explicit storyUrl prop wins; a route-path key maps straight
// to that path; an opaque entity id gets a fixed synthetic URL. Callers
// that render the thread away from its own page (the vibe feed popup) pass
// storyUrl explicitly so it matches the canonical vibe page.
const storyURL = computed<string | undefined>(() => {
  if (typeof window === 'undefined') return undefined
  const origin = window.location.origin
  if (props.storyUrl) {
    try {
      return new URL(props.storyUrl, origin).toString()
    } catch {
      /* fall through to the derived URL */
    }
  }
  const key = storyKey.value
  return key.startsWith('/') ? `${origin}${key}` : `${origin}/thread/${encodeURIComponent(key)}`
})

// '' when CORAL_SERVER_URL isn't set — every code path below guards on it.
// public.coralServerURL is registered by layers/social/nuxt.config.ts, but
// this repo's vue-tsc run doesn't merge per-layer runtimeConfig type
// augmentations into the generated config type (the experience-builder
// plugin reads its own public key through a cast for the same reason), so
// narrow it explicitly rather than take the phantom-property error.
const rootURL = (useRuntimeConfig().public as { coralServerURL?: string }).coralServerURL || ''
const containerRef = ref<HTMLElement | null>(null)
const elementId = `coral-thread-${Math.random().toString(36).slice(2)}`

// Coral's own bundle + first GraphQL round-trip against a self-hosted
// instance can take several seconds before anything paints — with nothing
// shown in the meantime this reads as "comments don't show" rather than
// "still loading". Watches for Coral actually inserting content into the
// container and only then drops the placeholder.
const showLoading = ref(true)
let observer: MutationObserver | undefined

// embed.js attaches a single global Coral object; loading it twice throws,
// and a page can mount more than one comments.vue instance (a feed of
// shorts, each with its own thread), so the script load itself is shared
// and awaited by every instance rather than fetched per-instance.
function loadEmbedScript(): Promise<void> {
  if (window.Coral) return Promise.resolve()
  let pending = window.__coralEmbedLoading
  if (!pending) {
    pending = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `${rootURL}/assets/js/embed.js`
      script.async = false
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Coral embed.js'))
      document.head.appendChild(script)
    })
    window.__coralEmbedLoading = pending
  }
  return pending
}

let started = false

async function initEmbed(container: HTMLElement): Promise<void> {
  if (started || !rootURL) return
  started = true

  observer = new MutationObserver(() => {
    if (container.childElementCount) {
      showLoading.value = false
      observer?.disconnect()
    }
  })
  observer.observe(container, { childList: true })

  container.id = elementId

  // A signed-out visitor still gets a usable (logged-out) embed — Coral's
  // own "Allow Registration" setting covers sign-up from inside the widget.
  const tokenResponse = await $fetch('/api/social/coral-token').catch(() => null)
  const token = tokenResponse?.token ?? null

  await loadEmbedScript()

  if (!window.Coral) {
    showLoading.value = false
    return
  }

  window.Coral.createStreamEmbed({
    id: elementId,
    rootURL,
    // storyURL only — no storyID (see the storyURL computed above).
    storyURL: storyURL.value,
    autoRender: true,
    accessToken: token || undefined
  })
}

onMounted(async () => {
  if (!rootURL) {
    // Nothing to load (Coral not configured) — don't leave the spinner up.
    showLoading.value = false
    return
  }

  // Under <ClientOnly>, the slot (and this template ref) can render a tick
  // after the component's own onMounted fires. Init as soon as the
  // container element exists — now if it's already there, otherwise the
  // first time the ref becomes non-null.
  await nextTick()
  if (containerRef.value) {
    initEmbed(containerRef.value)
    return
  }
  const stop = watch(containerRef, (el) => {
    if (el) {
      stop()
      initEmbed(el)
    }
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
