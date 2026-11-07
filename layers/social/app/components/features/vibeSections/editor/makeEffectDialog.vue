<template>
  <v-dialog :model-value="modelValue" max-width="520" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>Make your own {{ kind }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="name" label="Name" maxlength="120" density="comfortable" />
        <template v-if="kind === 'filter'">
          <p class="text-body-2 mb-2">Saves the filter settings you have in the editor now.</p>
        </template>
        <v-file-input v-else v-model="file" :accept="accept" :label="kind === 'sticker' ? 'Image (PNG, WebP or GIF, up to 2 MB)' : 'Image (JPEG, PNG or WebP, up to 5 MB)'"
          density="comfortable" prepend-icon="" prepend-inner-icon="fas fa-image" show-size />
        <p v-if="kind === 'sticker'" class="text-caption text-medium-emphasis">A PNG or WebP with a transparent background looks best.</p>
        <v-radio-group v-model="visibility" density="compact" hide-details class="mt-2">
          <v-radio value="private" label="Just for me" />
          <v-radio value="community" label="Share it free with the community" />
        </v-radio-group>
        <p class="text-caption text-medium-emphasis mt-2">
          Want to sell it? Sellers can list stickers, filters and backgrounds as products in their shop.
        </p>
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-2">{{ error }}</v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" :loading="saving" :disabled="!ready" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FilterConfig } from '../../../../utils/vibeEditor/types'

/** A member saves their own sticker, filter or background (POST /api/social/vibez/effects). */
const props = defineProps<{ modelValue: boolean, kind: 'sticker' | 'filter' | 'background', filter?: FilterConfig }>()
const emit = defineEmits<{ 'update:modelValue': [open: boolean], saved: [effect: Record<string, any>] }>()

const name = ref('')
const file = ref<File | File[] | null>(null)
const visibility = ref<'private' | 'community'>('private')
const saving = ref(false)
const error = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  name.value = ''
  file.value = null
  visibility.value = 'private'
  error.value = ''
})

const accept = computed(() => (props.kind === 'sticker' ? 'image/png,image/webp,image/gif' : 'image/jpeg,image/png,image/webp'))
const picked = computed(() => (Array.isArray(file.value) ? file.value[0] : file.value) ?? null)
const ready = computed(() => name.value.trim() && (props.kind === 'filter' ? Object.keys(props.filter ?? {}).length : picked.value))

async function save() {
  saving.value = true
  error.value = ''
  const form = new FormData()
  form.append('kind', props.kind)
  form.append('name', name.value.trim())
  form.append('visibility', visibility.value)
  if (props.kind === 'filter') form.append('config', JSON.stringify(props.filter ?? {}))
  else if (picked.value) form.append('file', picked.value)
  try {
    const effect = await $fetch<Record<string, any>>('/api/social/vibez/effects', { method: 'POST', body: form })
    emit('saved', effect)
    emit('update:modelValue', false)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || "That didn't save. Please try again."
  } finally {
    saving.value = false
  }
}
</script>
