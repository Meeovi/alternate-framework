<template>
  <div class="d-flex align-center ga-4 flex-wrap">
    <v-avatar :size="size" color="surface-variant">
      <v-img v-if="current" :src="current" :alt="name || 'Avatar'" cover />
      <span v-else class="text-h5">{{ initials }}</span>
    </v-avatar>

    <div class="d-flex flex-column ga-2">
      <div class="d-flex ga-2 flex-wrap">
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="fas fa-camera"
          :loading="busy"
          @click="picker?.click()"
        >
          {{ current ? 'Change avatar' : 'Upload avatar' }}
        </v-btn>
        <v-btn
          v-if="current"
          variant="text"
          color="error"
          prepend-icon="fas fa-trash"
          :disabled="busy"
          @click="remove"
        >
          Remove
        </v-btn>
      </div>
      <span class="text-caption text-medium-emphasis">JPG, PNG, GIF, WebP or AVIF, up to {{ maxMb }} MB.</span>
      <span v-if="error" class="text-caption text-error">{{ error }}</span>
    </div>

    <input
      ref="picker"
      type="file"
      accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
      hidden
      @change="onPick"
    >
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { authClient } from '../../../../lib/auth-client'
import { useAssetUpload } from '#shared/app/composables/media/useAssetUpload'

/**
 * Lets any signed-in user set their own avatar. The image goes to Pixanomy
 * (app.pixanomy.com) via /api/assets/upload; only the returned public link
 * is saved on the better-auth user (`users.image`).
 *
 *   <AvatarUploader v-model:image="user.image" :name="user.name" />
 */
const props = withDefaults(defineProps<{
  image?: string | null
  name?: string
  size?: number
  maxMb?: number
}>(), {
  image: null,
  name: '',
  size: 96,
  maxMb: 5,
})

const emit = defineEmits<{ 'update:image': [value: string | null] }>()

const picker = ref<HTMLInputElement | null>(null)
const current = ref<string | null>(props.image)
const saving = ref(false)
const error = ref('')
const { upload, uploading } = useAssetUpload()

watch(() => props.image, (value) => { current.value = value })

const busy = computed(() => saving.value || uploading.value)
const initials = computed(() =>
  (props.name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join(''))

async function save(url: string | null) {
  const { error: err } = await authClient.updateUser({ image: url } as any)
  if (err) throw new Error(err.message || 'Could not save avatar')
  current.value = url
  emit('update:image', url)
}

async function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  error.value = ''
  if (!file.type.startsWith('image/')) {
    error.value = 'Please choose an image file.'
    return
  }
  if (file.size > props.maxMb * 1024 * 1024) {
    error.value = `Image must be ${props.maxMb} MB or smaller.`
    return
  }

  saving.value = true
  try {
    const asset = await upload(file, { category: 'avatars' })
    await save(asset.url)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Upload failed'
  } finally {
    saving.value = false
  }
}

async function remove() {
  error.value = ''
  saving.value = true
  try {
    await save(null)
  } catch (e: any) {
    error.value = e?.message || 'Could not remove avatar'
  } finally {
    saving.value = false
  }
}
</script>
