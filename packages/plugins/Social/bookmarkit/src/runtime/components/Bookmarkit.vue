<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import { bookmarkHost, useBookmarks } from '../composables/useBookmarks'
import type { Bookmark, BookmarkFolder, BookmarkitPublicConfig } from '../types'
import BookmarkitCard from './BookmarkitCard.vue'

/**
 * The signed-in user's bookmarks in a responsive grid: search, folders,
 * and add / edit / move / delete. Guests get a sign-in link.
 *
 *   <Bookmarkit />
 */
const { loginPath } = useRuntimeConfig().public.bookmarkit as BookmarkitPublicConfig
const route = useRoute()
const {
  folders, bookmarks, status, error, signedIn,
  add, update, remove, addFolder, updateFolder, removeFolder,
} = useBookmarks()

const ALL = 0
const folderId = ref<number>(ALL)
const search = ref('')
const currentFolder = computed(() => folders.value.find((f) => f.id === folderId.value) ?? null)
const folderName = (id: number) => folders.value.find((f) => f.id === id)?.name ?? ''

const shown = computed(() => {
  const words = search.value.toLowerCase().split(/\s+/).filter(Boolean)
  return bookmarks.value.filter((b) => {
    if (folderId.value !== ALL && b.folderId !== folderId.value) return false
    const haystack = `${b.title} ${b.url} ${b.description}`.toLowerCase()
    return words.every((w) => haystack.includes(w))
  })
})

const messageOf = (e: unknown, fallback: string) =>
  (e as { data?: { statusMessage?: string, message?: string } })?.data?.statusMessage
  || (e as { data?: { message?: string } })?.data?.message
  || fallback

// ---- bookmark dialog ------------------------------------------------------
const bookmarkDialog = ref(false)
const bookmarkForm = ref({ id: 0, url: '', title: '', description: '', folderId: null as number | null })
const saving = ref(false)
const formError = ref('')

const openBookmark = (bookmark?: Bookmark) => {
  formError.value = ''
  bookmarkForm.value = bookmark
    ? { id: bookmark.id, url: bookmark.url, title: bookmark.title, description: bookmark.description, folderId: bookmark.folderId }
    : { id: 0, url: '', title: '', description: '', folderId: currentFolder.value?.id ?? folders.value[0]?.id ?? null }
  bookmarkDialog.value = true
}

const saveBookmark = async () => {
  const { id, url, title, description, folderId: folder } = bookmarkForm.value
  if (!url.trim() || saving.value) return
  saving.value = true
  formError.value = ''
  try {
    const input = { url: url.trim(), title, description, ...(folder ? { folderId: folder } : {}) }
    if (id) await update(id, input)
    else await add(input)
    bookmarkDialog.value = false
  } catch (e) {
    formError.value = messageOf(e, "The bookmark wasn't saved. Please try again.")
  } finally {
    saving.value = false
  }
}

// ---- folder dialog --------------------------------------------------------
const folderDialog = ref(false)
const folderForm = ref({ id: 0, name: '', description: '' })

const openFolder = (folder?: BookmarkFolder) => {
  formError.value = ''
  folderForm.value = folder ? { id: folder.id, name: folder.name, description: folder.description } : { id: 0, name: '', description: '' }
  folderDialog.value = true
}

const saveFolder = async () => {
  const { id, name, description } = folderForm.value
  if (!name.trim() || saving.value) return
  saving.value = true
  formError.value = ''
  try {
    if (id) await updateFolder(id, { name: name.trim(), description })
    else folderId.value = (await addFolder({ name: name.trim(), description })).id
    folderDialog.value = false
  } catch (e) {
    formError.value = messageOf(e, "The folder wasn't saved. Please try again.")
  } finally {
    saving.value = false
  }
}

// ---- delete ---------------------------------------------------------------
type Doomed = { kind: 'bookmark', item: Bookmark } | { kind: 'folder', item: BookmarkFolder }
const doomed = ref<Doomed | null>(null)

const confirmDelete = async () => {
  if (!doomed.value || saving.value) return
  saving.value = true
  formError.value = ''
  try {
    if (doomed.value.kind === 'bookmark') await remove(doomed.value.item.id)
    else {
      await removeFolder(doomed.value.item.id)
      folderId.value = ALL
    }
    doomed.value = null
  } catch (e) {
    formError.value = messageOf(e, "It wasn't deleted. Please try again.")
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bookmarkit">
    <v-alert v-if="!signedIn" type="info" variant="tonal">
      Sign in to see and manage your bookmarks.
      <template #append>
        <v-btn variant="text" :to="`${loginPath}?redirect=${encodeURIComponent(route.fullPath)}`" text="Sign in" />
      </template>
    </v-alert>

    <template v-else>
      <div class="bookmarkit__toolbar">
        <v-text-field v-model="search" class="bookmarkit__search" density="compact" variant="outlined" hide-details clearable
          prepend-inner-icon="fas fa-magnifying-glass" label="Search bookmarks" />
        <v-btn color="primary" prepend-icon="fas fa-plus" text="Add bookmark" @click="openBookmark()" />
        <v-btn variant="tonal" prepend-icon="fas fa-folder-plus" text="New folder" @click="openFolder()" />
      </div>

      <div v-if="folders.length" class="bookmarkit__folders">
        <v-chip-group v-model="folderId" mandatory selected-class="text-primary" column>
          <v-chip :value="ALL" filter variant="outlined">All ({{ bookmarks.length }})</v-chip>
          <v-chip v-for="folder in folders" :key="folder.id" :value="folder.id" filter variant="outlined">
            {{ folder.name }} ({{ folder.count }})
          </v-chip>
        </v-chip-group>
        <div v-if="currentFolder" class="bookmarkit__folder-actions">
          <v-btn size="small" variant="text" prepend-icon="fas fa-pen" text="Rename" @click="openFolder(currentFolder)" />
          <v-btn size="small" variant="text" color="error" prepend-icon="fas fa-trash" text="Delete folder"
            @click="formError = ''; doomed = { kind: 'folder', item: currentFolder }" />
        </div>
      </div>

      <v-alert v-if="error && signedIn" type="error" variant="tonal" class="mb-4"
        text="Your bookmarks couldn't be loaded. Please try again later." />

      <div v-if="status === 'pending' && !bookmarks.length" class="bookmarkit__grid" aria-busy="true">
        <v-skeleton-loader v-for="n in 4" :key="n" type="list-item-avatar-two-line, actions" />
      </div>

      <div v-else-if="shown.length" class="bookmarkit__grid">
        <BookmarkitCard v-for="bookmark in shown" :key="bookmark.id" :bookmark="bookmark"
          :folder-name="folderId === ALL && folders.length > 1 ? folderName(bookmark.folderId) : ''"
          @edit="openBookmark(bookmark)" @delete="formError = ''; doomed = { kind: 'bookmark', item: bookmark }" />
      </div>

      <div v-else-if="!error" class="bookmarkit__empty">
        <v-icon icon="fas fa-bookmark" size="40" class="mb-3" />
        <p v-if="search">No bookmarks match "{{ search }}".</p>
        <p v-else-if="currentFolder">Nothing in {{ currentFolder.name }} yet.</p>
        <p v-else>No bookmarks yet. Add the first one.</p>
      </div>
    </template>

    <!-- Add / edit a bookmark -->
    <v-dialog v-model="bookmarkDialog" max-width="520">
      <v-card :title="bookmarkForm.id ? 'Edit bookmark' : 'Add bookmark'">
        <v-form @submit.prevent="saveBookmark">
          <v-card-text>
            <v-text-field v-model="bookmarkForm.url" label="Web address" placeholder="https://" type="url" autofocus
              :rules="[(v: string) => !!v?.trim() || 'Web address is required']" />
            <v-text-field v-model="bookmarkForm.title" label="Title" :hint="bookmarkForm.url ? `Leave empty to use ${bookmarkHost(bookmarkForm.url)}` : ''" counter="200" />
            <v-textarea v-model="bookmarkForm.description" label="Note" rows="2" auto-grow counter="1000" />
            <v-select v-if="folders.length" v-model="bookmarkForm.folderId" label="Folder" :items="folders" item-title="name" item-value="id" />
            <v-alert v-if="formError" type="error" density="compact">{{ formError }}</v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" text="Cancel" @click="bookmarkDialog = false" />
            <v-btn type="submit" color="primary" :loading="saving" :disabled="!bookmarkForm.url.trim()" :text="bookmarkForm.id ? 'Save' : 'Add'" />
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- New / rename folder -->
    <v-dialog v-model="folderDialog" max-width="440">
      <v-card :title="folderForm.id ? 'Rename folder' : 'New folder'">
        <v-form @submit.prevent="saveFolder">
          <v-card-text>
            <v-text-field v-model="folderForm.name" label="Name" autofocus counter="80"
              :rules="[(v: string) => !!v?.trim() || 'Name is required']" />
            <v-textarea v-model="folderForm.description" label="Description" rows="2" auto-grow />
            <v-alert v-if="formError" type="error" density="compact">{{ formError }}</v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" text="Cancel" @click="folderDialog = false" />
            <v-btn type="submit" color="primary" :loading="saving" :disabled="!folderForm.name.trim()" :text="folderForm.id ? 'Save' : 'Create'" />
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Delete a bookmark or a folder -->
    <v-dialog :model-value="!!doomed" max-width="420" @update:model-value="(open: boolean) => { if (!open) doomed = null }">
      <v-card :title="doomed?.kind === 'folder' ? 'Delete folder' : 'Delete bookmark'">
        <v-card-text>
          <template v-if="doomed?.kind === 'folder'">
            Delete "{{ doomed.item.name }}" and the {{ doomed.item.count }} bookmark{{ doomed.item.count === 1 ? '' : 's' }} in it? This can't be undone.
          </template>
          <template v-else-if="doomed">
            Delete "{{ doomed.item.title || bookmarkHost(doomed.item.url) }}"?
          </template>
          <v-alert v-if="formError" type="error" density="compact" class="mt-3">{{ formError }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" text="Cancel" @click="doomed = null" />
          <v-btn color="error" text="Delete" :loading="saving" @click="confirmDelete" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.bookmarkit__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}
.bookmarkit__search {
  flex: 1 1 240px;
  min-width: 0;
}
.bookmarkit__folders {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 8px;
  margin-bottom: 12px;
}
.bookmarkit__folder-actions {
  display: flex;
  gap: 4px;
}
/* One column on phones, then as many ~260px columns as fit. */
.bookmarkit__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  gap: 16px;
}
.bookmarkit__empty {
  text-align: center;
  padding: 48px 16px;
  opacity: 0.75;
}
</style>
