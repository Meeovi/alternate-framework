<template>
  <section v-if="visible" class="cc" role="dialog" aria-modal="false" aria-labelledby="cc-title" aria-describedby="cc-text">
    <h2 id="cc-title" class="cc__title">Cookies on {{ siteName }}</h2>
    <p id="cc-text" class="cc__text">
      We use essential cookies to keep you signed in and the site secure. With your permission we'd also like
      to use analytics cookies to understand how the site is used, and advertising cookies to show and measure ads.
      <NuxtLink to="/cookie-policy">Cookie policy</NuxtLink> ·
      <NuxtLink to="/privacy-policies">Privacy policy</NuxtLink>
    </p>

    <fieldset v-if="choosing" class="cc__choices">
      <legend class="cc__sr">Choose cookies</legend>
      <label class="cc__choice">
        <input type="checkbox" checked disabled>
        <span><strong>Essential</strong> — sign-in, security, your basket. Always on.</span>
      </label>
      <label class="cc__choice">
        <input v-model="analytics" type="checkbox">
        <span><strong>Analytics</strong> — Google Analytics / Tag Manager, Microsoft (Bing) UET.</span>
      </label>
      <label class="cc__choice">
        <input v-model="ads" type="checkbox">
        <span><strong>Advertising</strong> — Google AdSense and social media pixels.</span>
      </label>
    </fieldset>

    <div class="cc__actions">
      <button type="button" class="cc__btn cc__btn--primary" @click="acceptAll">Accept all</button>
      <button type="button" class="cc__btn cc__btn--primary" @click="rejectAll">Reject non-essential</button>
      <button v-if="!choosing" type="button" class="cc__btn cc__btn--link" @click="choosing = true">Choose</button>
      <button v-else type="button" class="cc__btn" @click="save({ analytics, ads })">Save choices</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useCookieConsent } from '../../composables/useCookieConsent'

const { consent, decided, settingsOpen, acceptAll, rejectAll, save } = useCookieConsent()
const siteName = String((useRuntimeConfig().public as { siteName?: string }).siteName || 'this site')

const choosing = ref(false)
const analytics = ref(false)
const ads = ref(false)
const visible = computed(() => !decided.value || settingsOpen.value)

// Re-opened from "Cookie settings": start from the current choice.
watch(settingsOpen, (open) => {
  if (!open) return
  choosing.value = true
  analytics.value = consent.value?.analytics ?? false
  ads.value = consent.value?.ads ?? false
}, { immediate: true })
</script>

<style scoped>
.cc {
  position: fixed;
  inset: auto 16px 16px 16px;
  z-index: 3000;
  max-width: 640px;
  margin-inline: auto;
  padding: 16px 20px;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface, 255, 255, 255));
  color: rgb(var(--v-theme-on-surface, 33, 33, 33));
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.25);
  font-size: 14px;
  line-height: 1.5;
}
.cc__title { margin: 0 0 6px; font-size: 16px; font-weight: 600; }
.cc__text { margin: 0 0 12px; }
.cc__text a { color: rgb(var(--v-theme-primary, 25, 118, 210)); text-decoration: underline; }
.cc__choices { border: 0; margin: 0 0 12px; padding: 0; display: grid; gap: 8px; }
.cc__choice { display: flex; gap: 8px; align-items: flex-start; }
.cc__choice input { margin-top: 4px; }
.cc__actions { display: flex; flex-wrap: wrap; gap: 8px; }
.cc__btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgb(var(--v-theme-on-surface, 33, 33, 33) / 0.3);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
/* Accept and Reject look the same (ICO: refusing must be as easy as accepting). */
.cc__btn--primary { background: rgb(var(--v-theme-primary, 25, 118, 210)); border-color: transparent; color: #fff; }
.cc__btn--link { border-color: transparent; text-decoration: underline; }
.cc__btn:focus-visible { outline: 2px solid rgb(var(--v-theme-primary, 25, 118, 210)); outline-offset: 2px; }
.cc__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
</style>
