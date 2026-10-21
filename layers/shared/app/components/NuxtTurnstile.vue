<template>
  <component :is="element" ref="el" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { loadTurnstile, type TurnstileApi } from '../utils/turnstile'

/**
 * A Cloudflare Turnstile widget; v-model is the token. Same API as the
 * @nuxtjs/turnstile component it replaces (registered globally as
 * <NuxtTurnstile> by plugins/turnstile-component.ts): `reset()` via ref,
 * `siteKey` (defaults to runtimeConfig.public.turnstile.siteKey), `options`
 * passed to turnstile.render, and a periodic reset before tokens expire.
 */
const props = withDefaults(defineProps<{
  modelValue?: string
  element?: string
  siteKey?: string
  options?: Record<string, unknown>
  resetInterval?: number
}>(), {
  element: 'div',
  options: () => ({}),
  resetInterval: 250_000,
})
const emit = defineEmits<{ 'update:modelValue': [token: string] }>()

const config = (useRuntimeConfig().public as { turnstile?: { siteKey?: string } }).turnstile
const el = ref<HTMLElement>()
let turnstile: TurnstileApi | null = null
let id: string | undefined
let interval: ReturnType<typeof setInterval> | undefined
let unmounted = false

const reset = () => {
  if (turnstile && id) turnstile.reset(id)
}

onMounted(async () => {
  try {
    turnstile = await loadTurnstile()
  } catch (error) {
    console.warn('[turnstile]', error)
    return
  }
  if (unmounted || !el.value) return
  id = turnstile.render(el.value, {
    sitekey: props.siteKey || config?.siteKey,
    callback: (token: string) => emit('update:modelValue', token),
    ...props.options,
  })
  interval = setInterval(reset, props.resetInterval)
})

onBeforeUnmount(() => {
  unmounted = true
  clearInterval(interval)
  if (turnstile && id) turnstile.remove(id)
})

defineExpose({ reset })
</script>
