<script setup lang="ts">
import { computed, provide, ref, shallowRef } from 'vue'
import { useTheme } from 'vuetify'
import { Filemanager, getMenuOptions } from '@svar-ui/vue-filemanager'
import type { IApi, IEntity, IParsedEntity, TContextMenuType } from '@svar-ui/vue-filemanager'
import '@svar-ui/vue-filemanager/all.css'
import { useFetch, useHead, useRoute, useRuntimeConfig } from '#imports'
import type { GalleryEntry, GalleryFilesResponse, MeeoviGalleryPublicConfig } from '../types'
import MeeoviMediaViewer from './MeeoviMediaViewer.vue'
import type { ViewerItem } from './MeeoviMediaViewer.vue'

/**
 * The signed-in user's gallery: everything they've uploaded anywhere in
 * Meeovi (stored on Pixanomy), in SVAR File Manager — one folder per upload
 * category (posts, vibez, avatars…) and month. Files open in a viewer or
 * download; new files can be uploaded into the open category. Moving,
 * renaming and deleting are left out on purpose: posts, profiles and spaces
 * link to these files, so changing them here would break those pages.
 *
 *   <MeeoviGallery />
 *   <MeeoviGallery height="480px" mode="table" />
 */
const props = withDefaults(defineProps<{
  height?: string
  mode?: 'cards' | 'table' | 'panels'
}>(), {
  height: '70vh',
  mode: 'cards',
})

const { apiBase, uploadEndpoint, uploadCategory, loginPath } = useRuntimeConfig().public.meeoviGallery as MeeoviGalleryPublicConfig
const route = useRoute()

// Client-only: personal files are never rendered into the shared SSR HTML,
// and SVAR's widgets need the DOM.
const { data, status, error, refresh } = useFetch<GalleryFilesResponse>(`${apiBase}/files`, {
  server: false,
  lazy: true,
  key: 'meeovi-gallery-files',
})

const statusCode = computed(() => (error.value as { statusCode?: number } | null | undefined)?.statusCode)
const signedIn = computed(() => statusCode.value !== 401)

// SVAR mutates the entries it is given (parent, name, tree state), so it
// gets fresh copies; `byId` keeps the originals for links and types.
const byId = computed(() => new Map((data.value?.files ?? []).map((f) => [f.id, f])))
const entries = computed<IEntity[]>(() => (data.value?.files ?? []).map((f) => ({
  id: f.id,
  type: f.type,
  size: f.size,
  date: f.date ? new Date(f.date) : undefined,
})))
const drive = computed(() => ({ used: data.value?.drive.used ?? 0 }))

// ---- theme ----------------------------------------------------------------
// Willow without SVAR's <Willow> component, as in meeovi-tables: that
// component renders a <Teleport to="head"> which Nuxt can't hydrate. The
// theme is this context plus the wrapper class; fonts come from useHead.
const vuetifyTheme = useTheme()
const dark = computed(() => vuetifyTheme.global.current.value.dark)
provide('wx-theme', dark.value ? 'willow-dark' : 'willow')
useHead({
  link: [
    { rel: 'preconnect', href: 'https://cdn.svar.dev', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://cdn.svar.dev/fonts/wxi/wx-icons.css', key: 'svar-wx-icons' },
  ],
  style: [{
    key: 'svar-open-sans',
    textContent: [400, 500, 600, 700].map((w) => {
      const file = w === 400 ? 'regular' : w
      return `@font-face{font-family:'Open Sans';font-style:normal;font-weight:${w};src:local(''),url('https://cdn.svar.dev/fonts/open-sans/${file}.woff2') format('woff2'),url('https://cdn.svar.dev/fonts/open-sans/${file}.woff') format('woff')}`
    }).join(''),
  }],
})

// ---- viewing --------------------------------------------------------------
const viewer = ref(false)
const current = ref<ViewerItem | null>(null)

function view(entry: GalleryEntry) {
  if (!entry.url || !entry.kind) return
  if (entry.kind === 'other') {
    window.open(entry.shareUrl || entry.url, '_blank', 'noopener')
    return
  }
  current.value = {
    kind: entry.kind,
    url: entry.url,
    name: entry.id.slice(entry.id.lastIndexOf('/') + 1),
    contentType: entry.contentType,
    shareUrl: entry.shareUrl,
  }
  viewer.value = true
}

// Card thumbnails: a photo is its own preview (Pixanomy serves it through
// the public link); everything else shows its file-type icon.
function previews(file: { id: string }) {
  const entry = byId.value.get(file.id)
  return entry?.kind === 'image' && entry.url ? entry.url : null
}

function menuOptions(mode: TContextMenuType, item?: IParsedEntity) {
  if (mode === 'add') return getMenuOptions('add').filter((o: { id?: string | number }) => o.id === 'upload')
  if (mode !== 'file' || !item) return []
  const entry = byId.value.get(item.id)
  if (!entry?.url) return []
  return [
    { id: 'view', text: entry.kind === 'other' ? 'Open' : 'View', icon: 'wxi-eye', hotkey: '', handler: () => view(entry) },
    ...getMenuOptions('file').filter((o: { id?: string | number }) => o.id === 'download'),
  ]
}

// ---- uploading ------------------------------------------------------------
const uploading = ref(0)
const uploadError = ref('')
const api = shallowRef<IApi | null>(null)

/** Uploads go into the category folder that's open (or the default one). */
function categoryOf(parent: string) {
  const top = parent.split('/').filter(Boolean)[0]
  return top || uploadCategory || 'gallery'
}

async function upload(file: File, parent: string) {
  const body = new FormData()
  body.append('category', categoryOf(parent))
  body.append('file', file, file.name)
  uploading.value++
  uploadError.value = ''
  try {
    await $fetch(uploadEndpoint, { method: 'POST', body })
  } catch (e: any) {
    uploadError.value = `${file.name}: ${e?.data?.statusMessage || e?.statusMessage || 'upload failed'}`
  } finally {
    uploading.value--
  }
  if (!uploading.value) await refresh()
}

function init(fm: IApi) {
  api.value = fm
  fm.on('open-file', ({ id }: { id: string }) => {
    const entry = byId.value.get(id)
    if (entry) view(entry)
  })
  fm.on('download-file', ({ id }: { id: string }) => {
    const url = byId.value.get(id)?.url
    if (url) window.location.assign(url)
  })
  // Uploads (from the "+" menu or dropped files) go to Pixanomy through the
  // app's upload route instead of SVAR's in-memory store; the list reloads.
  fm.intercept('create-file', (ev: { file?: { file?: File }, parent: string }) => {
    if (ev.file?.file) void upload(ev.file.file, ev.parent)
    return false
  })
  // Read-only beyond uploads (see the top comment). Menus already hide
  // these; this also stops drag-and-drop moves and stray hotkeys.
  for (const action of ['rename-file', 'delete-files', 'move-files', 'copy-files'] as const) {
    fm.intercept(action, () => false)
  }
}
</script>

<template>
  <div class="meeovi-gallery">
    <!-- Everything below depends on the client-only fetch, whose status is
         already 'pending' when the page hydrates (SSR saw 'idle'), so it all
         renders on the client to keep hydration clean. -->
    <ClientOnly>
      <v-alert v-if="!signedIn" type="info" variant="tonal">
        <a :href="`${loginPath}?redirect=${encodeURIComponent(route.fullPath)}`">Sign in</a> to see your media.
      </v-alert>

      <v-alert v-else-if="error" type="error" variant="tonal">
        Your media couldn't be loaded right now. Please try again later.
      </v-alert>

      <template v-else>
        <v-alert v-if="uploadError" type="warning" variant="tonal" closable class="mb-3" @click:close="uploadError = ''">
          {{ uploadError }}
        </v-alert>
        <v-progress-linear v-if="uploading || status === 'pending'" indeterminate class="mb-2" />

        <div
          v-if="status === 'success'"
          :class="['meeovi-gallery__fm', 'wx-theme', dark ? 'wx-willow-dark-theme' : 'wx-willow-theme']"
          :style="{ height: props.height }"
        >
          <Filemanager
            :key="data?.files.length"
            :data="entries"
            :drive="drive"
            :mode="props.mode"
            :init="init"
            :menu-options="menuOptions"
            :previews="previews"
            icons="simple"
            preview
          />
        </div>
      </template>
      <template #fallback>
        <v-skeleton-loader type="image" :height="props.height" />
      </template>
    </ClientOnly>

    <MeeoviMediaViewer v-model="viewer" :item="current" />
  </div>
</template>

<style scoped>
.meeovi-gallery__fm {
  width: 100%;
  min-height: 360px;
  border-radius: 8px;
  overflow: hidden;
  --wx-color-primary: rgb(var(--v-theme-primary));
}

/* Photo thumbnails fill their card. */
.meeovi-gallery__fm :deep(.wx-cards .wx-card-preview) {
  object-fit: cover;
}
</style>
