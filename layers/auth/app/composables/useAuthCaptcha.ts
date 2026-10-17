import { computed, ref } from 'vue'
import { useRuntimeConfig } from '#imports'

/**
 * Cloudflare Turnstile for the auth forms whose endpoints the server-side
 * better-auth `captcha` plugin guards (sign-in, sign-up, password reset,
 * magic link, verification email, Bluesky sign-in — see
 * shared/utils/plugins.ts). Render
 * `<NuxtTurnstile v-if="captchaEnabled" ref="captchaWidget" v-model="captchaToken" />`
 * and pass `captchaFetchOptions()` as the auth call's fetch options.
 * Tokens are single-use, so call `resetCaptcha()` after every attempt.
 */
export function useAuthCaptcha() {
  const siteKey = (useRuntimeConfig().public as { turnstile?: { siteKey?: string } }).turnstile?.siteKey
  const captchaEnabled = Boolean(siteKey)
  const captchaToken = ref('')
  const captchaWidget = ref<{ reset?: () => void } | null>(null)
  const captchaMissing = computed(() => captchaEnabled && !captchaToken.value)

  const captchaFetchOptions = () =>
    captchaEnabled ? { headers: { 'x-captcha-response': captchaToken.value } } : {}

  const resetCaptcha = () => {
    captchaWidget.value?.reset?.()
    captchaToken.value = ''
  }

  return { captchaEnabled, captchaToken, captchaWidget, captchaMissing, captchaFetchOptions, resetCaptcha }
}
