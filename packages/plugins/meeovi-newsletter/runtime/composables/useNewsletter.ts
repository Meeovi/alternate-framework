import { computed, ref } from 'vue'
import type {
  NewsletterPublicRuntimeConfig,
  NewsletterSubscribeInput,
  NewsletterSubscribeResponse,
} from '../types'

export type NewsletterStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseNewsletterOptions {
  /** Where the signup happened — forwarded to the provider as metadata. */
  source?: string
  /** Override the endpoint base path (defaults to the module's `apiBase`). */
  apiBase?: string
}

/**
 * Headless newsletter subscription state + submit handler.
 *
 * Posts to the module's `/subscribe` endpoint, which dispatches to the
 * configured backend provider. The component `<MeeoviNewsletter>` is built
 * on top of this; use the composable directly for a custom form.
 */
export function useNewsletter(options: UseNewsletterOptions = {}) {
  const publicConfig = useRuntimeConfig().public.meeoviNewsletter as NewsletterPublicRuntimeConfig | undefined
  const apiBase = (options.apiBase ?? publicConfig?.apiBase ?? '/api/newsletter').replace(/\/+$/, '')

  const email = ref('')
  const firstName = ref('')
  const lastName = ref('')
  const status = ref<NewsletterStatus>('idle')
  const message = ref('')

  const pending = computed(() => status.value === 'loading')
  const succeeded = computed(() => status.value === 'success')

  function reset(): void {
    status.value = 'idle'
    message.value = ''
    email.value = ''
    firstName.value = ''
    lastName.value = ''
  }

  async function subscribe(
    extra: Partial<NewsletterSubscribeInput> = {},
  ): Promise<NewsletterSubscribeResponse | undefined> {
    if (status.value === 'loading') return
    status.value = 'loading'
    message.value = ''

    try {
      const res = await $fetch<NewsletterSubscribeResponse>(`${apiBase}/subscribe`, {
        method: 'POST',
        body: {
          email: email.value,
          firstName: firstName.value || undefined,
          lastName: lastName.value || undefined,
          source: options.source,
          ...extra,
        },
      })

      status.value = 'success'
      message.value =
        res.status === 'pending'
          ? 'Almost there — check your inbox to confirm your subscription.'
          : res.status === 'already_subscribed'
            ? "You're already on the list."
            : 'Thanks for subscribing!'
      email.value = ''
      return res
    }
    catch (err: any) {
      status.value = 'error'
      message.value =
        err?.data?.statusMessage
        ?? err?.data?.message
        ?? err?.statusMessage
        ?? err?.message
        ?? 'Something went wrong. Please try again.'
      throw err
    }
  }

  return {
    email,
    firstName,
    lastName,
    status,
    message,
    pending,
    succeeded,
    subscribe,
    reset,
  }
}
