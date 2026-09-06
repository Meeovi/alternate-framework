<template>
  <div class="atproto-auth">
    <p v-if="mode === 'link' && currentlyLinkedHandle" class="text-body-2 mb-4">
      Linked as <strong>@{{ currentlyLinkedHandle }}</strong>. Linking a different Bluesky account below replaces it.
    </p>

    <v-alert
      v-if="alertMessage"
      :type="alertType"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="alertMessage = ''"
    >
      {{ alertMessage }}
    </v-alert>

    <v-form @submit.prevent="submit">
      <template v-if="mode === 'sign-up'">
        <v-text-field
          v-model="desiredUsername"
          label="Choose a username"
          suffix=".sky.meeovicms.com"
          placeholder="alice"
          variant="outlined"
          required
          class="mb-4"
          hint="Or type a full handle (e.g. an existing custom domain) — a dot in the field skips the suffix"
          persistent-hint
        />
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          variant="outlined"
          required
          class="mb-4 mt-2"
        />
      </template>
      <v-text-field
        v-else
        v-model="identifier"
        label="Bluesky handle or DID"
        placeholder="alice.sky.meeovicms.com"
        variant="outlined"
        required
        autocomplete="username"
        class="mb-4"
      />

      <v-text-field
        v-model="password"
        :label="mode === 'sign-up' ? 'Password' : 'App Password'"
        type="password"
        variant="outlined"
        required
        :autocomplete="mode === 'sign-up' ? 'new-password' : 'current-password'"
        class="mb-4"
        :hint="mode !== 'sign-up' ? 'An app password from your PDS account settings — not your main account password' : undefined"
        :persistent-hint="mode !== 'sign-up'"
      />

      <v-text-field
        v-if="mode === 'sign-up'"
        v-model="passwordConfirmation"
        label="Confirm Password"
        type="password"
        autocomplete="new-password"
        variant="outlined"
        required
        class="mb-4"
      />

      <v-btn
        type="submit"
        block
        :color="mode === 'link' ? 'secondary' : 'primary'"
        :loading="loading"
        :disabled="loading"
        size="large"
      >
        {{ buttonLabel }}
      </v-btn>
    </v-form>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watchEffect } from 'vue'
  import { navigateTo, useFetch } from '#imports'
  import { useAuth } from '../../../composables/useAuth'

  const props = defineProps<{
    /** 'sign-in': existing atproto identity, issues a fresh session (may
     *  create a new local user — see login.vue).
     *  'sign-up': creates a brand-new account ON THE PDS itself, then
     *  signs in as it (see register.vue).
     *  'link': attaches an atproto identity to the CURRENT signed-in user
     *  without creating a user or swapping sessions (see
     *  settings/accounts.vue) — requires the viewer to already be
     *  authenticated. */
    mode?: 'sign-in' | 'sign-up' | 'link'
  }>()
  const mode = computed(() => props.mode || 'sign-in')

  const emit = defineEmits<{ linked: [handle: string] }>()

  const auth = useAuth()

  const identifier = ref('')
  const desiredUsername = ref('')
  const email = ref('')
  const password = ref('')
  const passwordConfirmation = ref('')
  const loading = ref(false)
  const alertMessage = ref('')
  const alertType = ref<'error' | 'success'>('error')

  const fullHandle = computed(() =>
    desiredUsername.value.includes('.') ? desiredUsername.value : `${desiredUsername.value}.sky.meeovicms.com`,
  )

  // Only relevant in 'link' mode — shows what's already linked, same
  // useSession(useFetch) pattern twoFactor.vue uses to read the current
  // user client-side.
  const currentlyLinkedHandle = ref<string | undefined>(undefined)
  if (mode.value === 'link') {
    const { data: sessionData } = await auth.useSession(useFetch)
    watchEffect(() => {
      currentlyLinkedHandle.value = (sessionData.value as any)?.user?.atprotoHandle || undefined
    })
  }

  const buttonLabel = computed(() => {
    if (loading.value) {
      return mode.value === 'sign-up' ? 'Creating account…' : mode.value === 'link' ? 'Linking…' : 'Signing in…'
    }
    return mode.value === 'sign-up' ? 'Create Bluesky Account' : mode.value === 'link' ? 'Link Bluesky Account' : 'Sign in with Bluesky'
  })

  async function submit() {
    if (loading.value) return
    alertMessage.value = ''

    if (mode.value === 'sign-up' && password.value !== passwordConfirmation.value) {
      alertType.value = 'error'
      alertMessage.value = 'Passwords do not match'
      return
    }

    loading.value = true
    try {
      const path = mode.value === 'sign-up' ? '/sign-up/atproto' : mode.value === 'link' ? '/link/atproto' : '/sign-in/atproto'
      const body = mode.value === 'sign-up'
        ? { handle: fullHandle.value, password: password.value, email: email.value }
        : { identifier: identifier.value, appPassword: password.value }

      const { data, error } = await auth.$fetch<{
        user: Record<string, unknown>
        session?: Record<string, unknown>
        isNewUser?: boolean
        atproto: { did: string, handle: string }
      }>(path, { method: 'POST', body })

      if (error) {
        alertType.value = 'error'
        alertMessage.value = error.message || 'Failed to authenticate with the AT Protocol service'
        return
      }

      alertType.value = 'success'
      if (mode.value === 'link') {
        currentlyLinkedHandle.value = data?.atproto?.handle
        alertMessage.value = `Linked as @${data?.atproto?.handle}`
        emit('linked', data?.atproto?.handle)
      } else {
        await auth.fetchSession()
        alertMessage.value = mode.value === 'sign-up' ? 'Bluesky account created — you are signed in!' : 'You have been signed in!'
        await navigateTo('/')
      }
    } catch (err: any) {
      alertType.value = 'error'
      alertMessage.value = err?.message || 'Something went wrong'
      console.error('atproto auth error:', err)
    } finally {
      loading.value = false
    }
  }
</script>
