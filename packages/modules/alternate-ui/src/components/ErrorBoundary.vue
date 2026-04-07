<template>
  <div v-if="!renderError" class="aui-error-boundary">
    <slot />
  </div>
  <div v-else class="aui-error-fallback" role="alert">
    <strong>{{ title }}</strong>
    <p v-if="showDetails" class="aui-error-fallback__details">
      {{ error?.message || fallbackMessage }}
    </p>
    <button class="aui-error-fallback__button" type="button" @click="resetError">
      Try again
    </button>
  </div>
</template>

<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
    fallbackMessage?: string
    showDetails?: boolean
  }>(),
  {
    title: 'Something went wrong',
    fallbackMessage: 'An unexpected error occurred.',
    showDetails: false,
  },
)

const renderError = ref(false)
const error = ref<Error | null>(null)

const resetError = () => {
  error.value = null
  renderError.value = false
}

onErrorCaptured((capturedError) => {
  error.value = capturedError instanceof Error ? capturedError : new Error(String(capturedError))
  renderError.value = true
  return false
})
</script>

<style scoped>
.aui-error-fallback {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 1rem;
  background: rgba(220, 38, 38, 0.08);
  color: #7f1d1d;
}

.aui-error-fallback__details {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.8125rem;
}

.aui-error-fallback__button {
  width: fit-content;
  min-height: 2.25rem;
  padding: 0.5rem 0.875rem;
  border: 0;
  border-radius: 999px;
  background: #fff;
  color: #7f1d1d;
  cursor: pointer;
}
</style>
