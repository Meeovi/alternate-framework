<template>
  <section
    class="meeovi-newsletter"
    :class="`meeovi-newsletter--${variant}`"
    data-form-type="formoid"
  >
    <div class="meeovi-newsletter__inner">
      <slot name="header">
        <h5 v-if="title" class="meeovi-newsletter__title">{{ title }}</h5>
      </slot>

      <slot name="description">
        <p v-if="description" class="meeovi-newsletter__description">{{ description }}</p>
      </slot>

      <form class="meeovi-newsletter__form" @submit.prevent="onSubmit">
        <!-- Honeypot: invisible to a real visitor, often filled by bots.
             aria-hidden + tabindex="-1" keep it out of the way for
             screen-reader and keyboard users; off-screen positioning
             (rather than display:none) since some bots skip hidden fields
             specifically to avoid honeypots. -->
        <input
          v-model="honeypot"
          type="text"
          name="company"
          class="meeovi-newsletter__honeypot"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
        >

        <v-text-field
          v-model="email"
          class="meeovi-newsletter__input"
          type="email"
          name="email"
          autocomplete="email"
          :label="placeholder"
          :placeholder="placeholder"
          :disabled="pending"
          :error="status === 'error'"
          density="comfortable"
          variant="solo"
          hide-details
          single-line
          required
        >
          <template #append-inner>
            <v-icon size="small">fas fa-envelope</v-icon>
          </template>
        </v-text-field>

        <v-btn
          class="meeovi-newsletter__submit"
          type="submit"
          :loading="pending"
          :disabled="pending"
          color="primary"
          size="large"
        >
          {{ buttonText }}
        </v-btn>
      </form>

      <ClientOnly v-if="turnstileEnabled">
        <NuxtTurnstile v-model="turnstileToken" class="meeovi-newsletter__turnstile" />
      </ClientOnly>

      <p
        v-if="message"
        class="meeovi-newsletter__message"
        :class="status === 'error'
          ? 'meeovi-newsletter__message--error'
          : 'meeovi-newsletter__message--success'"
        role="status"
        aria-live="polite"
      >
        {{ message }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useNewsletter } from '../composables/useNewsletter'
import type { NewsletterPublicRuntimeConfig, NewsletterSubscribeResponse } from '../types'

const props = withDefaults(defineProps<{
  /** Heading above the form. */
  title?: string
  /** Supporting copy. For rich markup use the `#description` slot instead. */
  description?: string
  /** Submit button label. */
  buttonText?: string
  /** Email input label / placeholder. */
  placeholder?: string
  /** Signup origin, forwarded to the backend as metadata. */
  source?: string
  /** Layout preset: `inline` (default), `card`, or `compact`. */
  variant?: 'inline' | 'card' | 'compact'
}>(), {
  title: undefined,
  description: undefined,
  buttonText: undefined,
  placeholder: undefined,
  source: 'newsletter',
  variant: 'inline',
})

const emit = defineEmits<{
  (e: 'subscribed', payload: NewsletterSubscribeResponse): void
  (e: 'error', error: unknown): void
}>()

const ui = (useRuntimeConfig().public.meeoviNewsletter as NewsletterPublicRuntimeConfig | undefined)?.ui ?? {}

const title = computed(() => props.title ?? ui.title)
const description = computed(() => props.description ?? ui.description)
const buttonText = computed(() => props.buttonText ?? ui.buttonText ?? 'Subscribe')
const placeholder = computed(() => props.placeholder ?? ui.placeholder ?? 'Your email address')

const {
  email,
  status,
  message,
  pending,
  honeypot,
  turnstileToken,
  turnstileEnabled,
  subscribe,
} = useNewsletter({ source: props.source })

watch(status, (value) => {
  if (value === 'success' && ui.successMessage) message.value = ui.successMessage
})

async function onSubmit(): Promise<void> {
  if (turnstileEnabled && !turnstileToken.value) {
    status.value = 'error'
    message.value = 'Please complete the verification.'
    return
  }

  try {
    const res = await subscribe()
    if (res) emit('subscribed', res)
  }
  catch (err) {
    emit('error', err)
  }
}
</script>

<style scoped>
.meeovi-newsletter__inner {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meeovi-newsletter__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meeovi-newsletter__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.meeovi-newsletter__message {
  margin: 0;
  font-size: 0.875rem;
}

.meeovi-newsletter__message--error {
  color: rgb(var(--v-theme-error, 211 47 47));
}

.meeovi-newsletter__message--success {
  color: rgb(var(--v-theme-success, 46 125 50));
}

.meeovi-newsletter--card .meeovi-newsletter__inner {
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: rgb(var(--v-theme-surface, 245 245 245));
}

.meeovi-newsletter--compact .meeovi-newsletter__inner {
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .meeovi-newsletter--inline .meeovi-newsletter__form,
  .meeovi-newsletter--compact .meeovi-newsletter__form {
    flex-direction: row;
    align-items: flex-start;
  }

  .meeovi-newsletter--inline .meeovi-newsletter__input,
  .meeovi-newsletter--compact .meeovi-newsletter__input {
    flex: 1 1 auto;
  }
}
</style>
