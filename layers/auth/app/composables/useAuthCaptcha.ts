import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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

  // The Turnstile script can be blocked (privacy/ad-block extensions, strict
  // browsers) or never run, which used to leave a silently disabled Sign In
  // button (4 November 2026). After 10 s without the script, say so.
  const captchaBlocked = ref(false)
  let blockedTimer: ReturnType<typeof setTimeout> | undefined
  const checkCaptchaLoaded = () => {
    clearTimeout(blockedTimer)
    captchaBlocked.value = false
    blockedTimer = setTimeout(() => {
      captchaBlocked.value = captchaEnabled && !captchaToken.value
        && !(window as { turnstile?: unknown }).turnstile
    }, 10_000)
  }
  const retryCaptcha = () => {
    // A fresh page load re-requests the blocked script once the visitor has
    // allowed challenges.cloudflare.com.
    if (!(window as { turnstile?: unknown }).turnstile) return window.location.reload()
    resetCaptcha()
    checkCaptchaLoaded()
  }
  if (captchaEnabled) {
    onMounted(checkCaptchaLoaded)
    onBeforeUnmount(() => clearTimeout(blockedTimer))
  }

  return { captchaEnabled, captchaToken, captchaWidget, captchaMissing, captchaFetchOptions, resetCaptcha, captchaBlocked, retryCaptcha }
}
