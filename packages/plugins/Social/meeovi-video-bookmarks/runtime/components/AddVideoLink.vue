<template>
  <v-btn v-if="isSeller" color="primary" prepend-icon="fas fa-link" v-bind="$attrs" @click="open = true">{{ label }}</v-btn>

  <v-dialog v-model="open" max-width="640">
    <v-card class="add-video-link">
      <v-card-title>Add a video</v-card-title>
      <v-card-subtitle class="text-wrap">
        Paste a link from {{ providerList }}. It's listed in Videos as a free product from you once the store approves it.
        Adult and sexual content isn't allowed and is refused automatically.
      </v-card-subtitle>

      <v-card-text>
        <v-form @submit.prevent="check">
          <v-text-field v-model="url" label="Video link" placeholder="https://www.youtube.com/watch?v=…" type="url"
            prepend-inner-icon="fas fa-link" :disabled="busy || !!added" autofocus clearable hide-details="auto"
            @update:model-value="preview = null; error = ''; existingKey = null" />
        </v-form>

        <v-alert v-if="error" type="error" variant="tonal" class="mt-4" density="compact">
          {{ error }}
          <template v-if="needsSignIn"> <NuxtLink :to="loginPath">Sign in</NuxtLink></template>
          <template v-if="existingKey"> <NuxtLink :to="api.productPath(existingKey)" @click="open = false">See it</NuxtLink></template>
        </v-alert>

        <v-alert v-if="added" type="success" variant="tonal" class="mt-4">
          Added. Your video will be listed in Videos once the store approves it.
          <template v-if="added.problems.length"> (Some details didn't save: {{ added.problems.join(', ') }}.)</template>
          <NuxtLink :to="api.manageProductsPath" @click="open = false">See your products</NuxtLink>
        </v-alert>

        <template v-else-if="preview">
          <v-alert v-if="preview.existing" type="info" variant="tonal" density="compact" class="mt-4">
            That video is already on Meeovi. <NuxtLink :to="api.productPath(preview.existing)" @click="open = false">See it</NuxtLink>
          </v-alert>
          <div class="add-video-link__preview mt-4">
            <img v-if="preview.thumbnail" :src="preview.thumbnail" alt="" referrerpolicy="no-referrer" />
            <div>
              <div class="text-caption text-medium-emphasis">{{ preview.providerLabel }}<template v-if="preview.author"> · {{ preview.author }}</template></div>
              <div class="font-weight-bold">{{ preview.title }}</div>
            </div>
          </div>
          <v-text-field v-model="name" label="Title" class="mt-4" maxlength="200" counter hide-details="auto" />
          <v-textarea v-model="description" label="Description (optional)" rows="3" auto-grow maxlength="5000" class="mt-2" hide-details="auto" />
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="busy" @click="open = false">{{ added ? 'Close' : 'Cancel' }}</v-btn>
        <template v-if="!added">
          <v-btn v-if="!preview" color="primary" variant="flat" :loading="busy" :disabled="!url" @click="check">Check link</v-btn>
          <v-btn v-else color="primary" variant="flat" :loading="busy" :disabled="!name.trim() || !!preview.existing" @click="save">Add video</v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useVideoBookmarks, videoErrorMessage, type AddedVideo, type VideoPreview } from '../composables/useVideoBookmarks'

/**
 * "Add video" (sellers): paste a link, check it (adult links are refused by
 * the server), add it as a free product in Theater → Videos. Emits `added`.
 */
defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{ label?: string }>(), { label: 'Add video' })
const emit = defineEmits<{ added: [video: AddedVideo] }>()

const api = useVideoBookmarks()
const route = useRoute()
const providerList = computed(() => Object.values(api.providers).join(', '))
const loginPath = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`)

// Linked videos are store products: the button only shows for sellers.
const isSeller = ref(false)
onMounted(async () => {
  const session = await $fetch<{ user?: { role?: string | null } } | null>('/api/auth/get-session').catch(() => null)
  isSeller.value = String(session?.user?.role || '').split(',').map((r) => r.trim()).some((r) => r === 'seller' || r === 'admin')
})

const open = ref(false)
const url = ref('')
const preview = ref<VideoPreview | null>(null)
const name = ref('')
const description = ref('')
const added = ref<AddedVideo | null>(null)
const busy = ref(false)
const error = ref('')
const needsSignIn = ref(false)
const existingKey = ref<string | null>(null)

watch(open, (value) => {
  if (value) return
  url.value = ''; preview.value = null; name.value = ''; description.value = ''; added.value = null
  error.value = ''; needsSignIn.value = false; existingKey.value = null
})

function fail(e: any, fallback: string) {
  error.value = videoErrorMessage(e, fallback)
  needsSignIn.value = e?.statusCode === 401 || e?.response?.status === 401
  existingKey.value = e?.data?.data?.key ?? null
}

async function check() {
  if (!url.value || busy.value) return
  busy.value = true; error.value = ''; existingKey.value = null
  try {
    preview.value = await api.preview(url.value.trim())
    name.value = preview.value.title
    description.value = preview.value.description
  } catch (e) {
    fail(e, 'That link could not be checked.')
  } finally {
    busy.value = false
  }
}

async function save() {
  if (!preview.value || busy.value) return
  busy.value = true; error.value = ''
  try {
    added.value = await api.add({ url: url.value.trim(), name: name.value.trim(), description: description.value.trim() })
    emit('added', added.value)
  } catch (e) {
    fail(e, 'That video could not be added.')
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.add-video-link__preview {
  display: flex;
  gap: 12px;
  align-items: center;
}

.add-video-link__preview img {
  width: 160px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 6px;
  flex: none;
}
</style>
