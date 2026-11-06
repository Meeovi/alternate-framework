<template>
  <!-- Connect with Me: a member's links, one big button each (like Linktree).
       The owner edits them in place: add, reorder, change, remove, save. -->
  <div class="connect mx-auto">
    <div class="text-center mb-6">
      <v-avatar v-if="avatar" :image="avatar" size="96" class="mb-3" />
      <div class="text-h6">{{ name }}</div>
      <div v-if="username" class="text-medium-emphasis">@{{ username }}</div>
      <p v-if="bio" class="connect__bio text-body-2 mt-2">{{ bio }}</p>
      <v-btn class="mt-3" size="small" variant="tonal" prepend-icon="fas fa-share-nodes" @click="share">
        {{ copied ? 'Link copied' : 'Share my links' }}
      </v-btn>
    </div>

    <template v-if="!editing">
      <template v-if="links.length">
        <v-btn
          v-for="(link, index) in links"
          :key="`${index}-${link.url}`"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
          :prepend-icon="link.icon"
          class="connect__link mb-3"
          size="x-large"
          variant="outlined"
          rounded="xl"
          block
        >
          <div class="d-flex flex-column align-start text-left connect__text">
            <span>{{ link.title }}</span>
            <span v-if="link.description" class="text-caption text-medium-emphasis">{{ link.description }}</span>
          </div>
        </v-btn>
      </template>
      <p v-else class="text-center text-medium-emphasis">
        {{ isOwner ? 'Add the places people can find you: your website, shop, socials, anything with a link.' : 'No links yet.' }}
      </p>

      <div v-if="isOwner" class="text-center mt-4">
        <v-btn color="primary" prepend-icon="fas fa-pen" @click="startEditing">
          {{ links.length ? 'Edit links' : 'Add links' }}
        </v-btn>
      </div>
    </template>

    <!-- The owner's editor -->
    <v-form v-else @submit.prevent="save">
      <v-card v-for="(link, index) in draft" :key="link.key" class="mb-3" variant="outlined" rounded="lg">
        <v-card-text class="pb-0">
          <v-row dense>
            <v-col cols="12" sm="5">
              <v-text-field v-model="link.title" label="Title" placeholder="My shop" maxlength="80" density="comfortable" />
            </v-col>
            <v-col cols="12" sm="7">
              <v-text-field
                v-model="link.url"
                label="Web address"
                placeholder="https://…"
                inputmode="url"
                maxlength="2048"
                density="comfortable"
                :rules="[validUrl]"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="link.description" label="Description (optional)" maxlength="200" density="comfortable" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-btn icon="fas fa-arrow-up" size="small" variant="text" :disabled="index === 0" aria-label="Move up" @click="move(index, -1)" />
          <v-btn icon="fas fa-arrow-down" size="small" variant="text" :disabled="index === draft.length - 1" aria-label="Move down" @click="move(index, 1)" />
          <v-spacer />
          <v-btn color="error" size="small" variant="text" prepend-icon="fas fa-trash" @click="draft.splice(index, 1)">Remove</v-btn>
        </v-card-actions>
      </v-card>

      <v-btn block variant="tonal" prepend-icon="fas fa-plus" class="mb-4" :disabled="draft.length >= MAX" @click="add">
        Add a link
      </v-btn>

      <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-3">{{ error }}</v-alert>

      <div class="d-flex ga-2 justify-end">
        <v-btn variant="text" :disabled="saving" @click="editing = false">Cancel</v-btn>
        <v-btn color="primary" type="submit" :loading="saving">Save links</v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type Link = { label?: string, title: string, url: string, description?: string, icon?: string }

const props = withDefaults(defineProps<{
  links?: Link[]
  name?: string
  username?: string | null
  avatar?: string | null
  bio?: string | null
  isOwner?: boolean
  /** Address of this tab, for "Share my links". */
  shareUrl?: string
}>(), { links: () => [], name: '', username: null, avatar: null, bio: null, isOwner: false, shareUrl: '' })

const emit = defineEmits<{ saved: [links: Link[]] }>()

const MAX = 30
const editing = ref(false)
const saving = ref(false)
const error = ref('')
const copied = ref(false)
let nextKey = 0
const draft = ref<Array<{ key: number, title: string, url: string, description: string }>>([])

const startEditing = () => {
  draft.value = props.links.map((link) => ({ key: nextKey++, title: link.label ?? link.title, url: link.url, description: link.description || '' }))
  if (!draft.value.length) add()
  error.value = ''
  editing.value = true
}
const add = () => draft.value.push({ key: nextKey++, title: '', url: '', description: '' })
const move = (index: number, by: number) => {
  const [item] = draft.value.splice(index, 1)
  draft.value.splice(index + by, 0, item!)
}
const validUrl = (value: string) => {
  if (!value?.trim()) return 'Enter a web address'
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value.trim()) ? value.trim() : `https://${value.trim()}`)
    return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.') ? true : 'Enter a web address (https://…)'
  } catch {
    return 'Enter a web address (https://…)'
  }
}

const save = async () => {
  // Rows left completely empty are dropped rather than refused.
  const rows = draft.value.filter((link) => link.title.trim() || link.url.trim() || link.description.trim())
  const bad = rows.findIndex((link) => validUrl(link.url) !== true)
  if (bad >= 0) {
    error.value = `Link ${bad + 1} needs a web address.`
    return
  }
  saving.value = true
  error.value = ''
  try {
    const res = await $fetch<{ links: Link[] }>('/api/profiles/me/links', {
      method: 'PUT',
      body: { links: rows.map(({ title, url, description }) => ({ title, url, description })) },
    })
    emit('saved', res.links)
    editing.value = false
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.statusMessage || "Your links couldn't be saved. Please try again."
  } finally {
    saving.value = false
  }
}

const share = async () => {
  const url = props.shareUrl || window.location.href
  try {
    if (navigator.share) await navigator.share({ title: props.name, url })
    else await navigator.clipboard.writeText(url)
    copied.value = !navigator.share
    setTimeout(() => (copied.value = false), 2500)
  } catch { /* closed the share sheet */ }
}
</script>

<style scoped>
.connect {
  max-width: 580px;
}

.connect__bio {
  white-space: pre-line;
}

.connect__link {
  height: auto !important;
  min-height: 60px;
  padding-top: 10px;
  padding-bottom: 10px;
  text-transform: none;
  letter-spacing: normal;
  justify-content: flex-start;
}

.connect__text {
  white-space: normal;
  overflow-wrap: anywhere;
}
</style>
