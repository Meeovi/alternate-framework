<template>
  <div class="meeovi-newsletter-box relative">
    <v-sheet class="p-4 text-center sm:p-10" rounded>
      <MeeoviNewsletter
        variant="compact"
        :title="title"
        :description="description"
        :button-text="buttonText"
        :placeholder="placeholder"
        :source="source"
        v-bind="$attrs"
        @subscribed="$emit('subscribed', $event)"
        @error="$emit('error', $event)"
      >
        <template v-if="$slots.description" #description>
          <slot name="description" />
        </template>
      </MeeoviNewsletter>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import MeeoviNewsletter from './MeeoviNewsletter.vue'
import type { NewsletterSubscribeResponse } from '../types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  title?: string
  description?: string
  buttonText?: string
  placeholder?: string
  source?: string
}>(), {
  title: undefined,
  description: 'Be aware of upcoming sales and events. Receive gifts and special offers!',
  buttonText: 'Subscribe to Newsletter',
  placeholder: 'Your email',
  source: 'newsletter-box',
})

defineEmits<{
  (e: 'subscribed', payload: NewsletterSubscribeResponse): void
  (e: 'error', error: unknown): void
}>()
</script>
