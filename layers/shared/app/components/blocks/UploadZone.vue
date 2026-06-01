<script setup lang="ts">
import { computed } from 'vue'
import type { UploadRouter } from '../../../server/uploadthing'

type UploadEndpoint = keyof UploadRouter

const props = withDefaults(defineProps<{
  endpoint?: UploadEndpoint
  successMessage?: string
  showAlert?: boolean
  className?: string
  appearance?: Record<string, unknown>
  content?: Record<string, unknown>
  configOverrides?: Record<string, unknown>
  onClientUploadComplete?: (res: unknown) => void
  onUploadBegin?: () => void
  onUploadError?: (err: unknown) => void
}>(), {
  endpoint: 'videoAndImage',
  successMessage: 'Upload Completed',
  showAlert: true,
})

const emit = defineEmits<{
  (e: 'upload-begin'): void
  (e: 'upload-complete', payload: unknown): void
  (e: 'upload-error', payload: unknown): void
}>()

const config = computed(() => ({
  ...(props.configOverrides || {}),
  endpoint: props.endpoint,
  appearance: props.appearance,
  content: props.content,
  onClientUploadComplete: (res: unknown) => {
    console.log('onClientUploadComplete', res)
    if (props.showAlert && typeof window !== 'undefined') {
      window.alert(props.successMessage)
    }
    emit('upload-complete', res)
    props.onClientUploadComplete?.(res)
  },
  onUploadBegin: () => {
    console.log('onUploadBegin')
    emit('upload-begin')
    props.onUploadBegin?.()
  },
  onUploadError: (err: unknown) => {
    console.error('onUploadError', err)
    emit('upload-error', err)
    props.onUploadError?.(err)
  },
}))
</script>

<template>
  <UploadDropzone :class="props.className" :config="config" />
</template>