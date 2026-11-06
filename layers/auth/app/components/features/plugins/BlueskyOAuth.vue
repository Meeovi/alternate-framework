<template>
  <v-form class="bluesky-oauth" @submit.prevent="start">
    <v-text-field
      v-model="handle"
      label="Bluesky handle"
      placeholder="you.bsky.social"
      prepend-inner-icon="fab fa-bluesky"
      variant="outlined"
      density="comfortable"
      autocomplete="username"
      autocapitalize="off"
      spellcheck="false"
      hint="You'll approve Meeovi on your Bluesky server, then come straight back. Meeovi never sees your password."
      persistent-hint
      :error-messages="error ? [error] : []"
      class="mb-3"
    />
    <v-btn type="submit" block size="large" :color="link ? 'secondary' : 'primary'" variant="flat"
      prepend-icon="fab fa-bluesky" :loading="loading" :disabled="!handle.trim()">
      {{ link ? 'Connect Bluesky' : 'Continue with Bluesky' }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from '#imports'

/**
 * "Sign in with Bluesky" through AT Protocol OAuth (meeovi-atproto
 * auth/plugin.ts, /api/auth/sign-in/atproto/oauth): the member types their
 * handle, approves Meeovi on their own PDS, and comes back signed in (or,
 * with `link`, with Bluesky connected to their account). Works with any
 * PDS. The request carries Turnstile through the site-wide fetch wrapper.
 */
const props = withDefaults(defineProps<{
  /** Connect Bluesky to the signed-in member instead of signing in. */
  link?: boolean
  /** Path on this site to come back to. */
  callbackURL?: string
}>(), { link: false, callbackURL: '/' })

const handle = ref('')
const loading = ref(false)
const error = ref('')

// Linking that didn't finish comes back with ?error= (the login page shows its own).
const route = useRoute()
const MESSAGES: Record<string, string> = {
  bluesky_denied: 'Connecting Bluesky was cancelled.',
  bluesky_failed: "Connecting Bluesky didn't finish. Please try again.",
  bluesky_linked_elsewhere: 'That Bluesky account is already connected to another Meeovi account.',
}
onMounted(() => {
  if (props.link) error.value = MESSAGES[String(route.query.error || '')] || ''
})

async function start() {
  error.value = ''
  loading.value = true
  try {
    const res = await $fetch<{ url: string }>('/api/auth/sign-in/atproto/oauth', {
      method: 'POST',
      body: { handle: handle.value.trim().replace(/^@/, ''), callbackURL: props.callbackURL, link: props.link || undefined },
    })
    window.location.href = res.url
  } catch (e: any) {
    error.value = e?.data?.message || e?.data?.statusMessage || "Bluesky sign-in couldn't start. Please try again."
    loading.value = false
  }
}
</script>
