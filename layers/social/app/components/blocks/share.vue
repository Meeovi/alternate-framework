<template>
  <!-- The browser's share sheet where there is one (phones, Safari, Edge/Chrome
       on Windows and macOS); elsewhere (desktop Firefox, Chrome on Linux) a menu
       with "Copy link" and the usual networks. It used to be a disabled button
       saying sharing wasn't supported in this browser. -->
  <v-menu v-model="menuOpen" location="bottom">
    <template #activator="{ props: menuProps }">
      <v-btn class="shareBtn" v-bind="nativeShare ? {} : menuProps" variant="text" prepend-icon="fas fa-share-nodes"
        size="medium" title="Share" :aria-label="title ? `Share ${title}` : 'Share'" @click="onClick" />
    </template>
    <v-list density="compact" class="shareMenu">
      <v-list-item prepend-icon="fas fa-link" :title="copied ? 'Link copied' : 'Copy link'" @click.stop="copyLink" />
      <v-list-item v-for="target in targets" :key="target.name" :prepend-icon="target.icon" :title="target.name"
        :href="target.href" target="_blank" rel="noopener noreferrer" />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useShare } from '@vueuse/core'

// What to share: a path on this site (e.g. a note's page) or a full URL;
// without one, the page you're on.
const props = defineProps<{ url?: string | null, title?: string | null }>()

const { share, isSupported } = useShare()
const menuOpen = ref(false)
const copied = ref(false)

const nativeShare = computed(() => isSupported.value)

const shareUrl = () => {
  if (!import.meta.client) return props.url || ''
  return props.url ? new URL(props.url, window.location.origin).href : window.location.href
}
const shareTitle = () => props.title || 'Meeovi'

const targets = computed(() => {
  if (!menuOpen.value) return []
  const u = encodeURIComponent(shareUrl())
  const t = encodeURIComponent(shareTitle())
  return [
    { name: 'Bluesky', icon: 'fab fa-bluesky', href: `https://bsky.app/intent/compose?text=${t}%20${u}` },
    { name: 'X', icon: 'fab fa-x-twitter', href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { name: 'Facebook', icon: 'fab fa-facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: 'LinkedIn', icon: 'fab fa-linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: 'WhatsApp', icon: 'fab fa-whatsapp', href: `https://wa.me/?text=${t}%20${u}` },
    { name: 'Email', icon: 'fas fa-envelope', href: `mailto:?subject=${t}&body=${u}` },
  ]
})

async function onClick() {
  if (!nativeShare.value) return // the menu opens instead
  try {
    await share({ title: shareTitle(), text: '', url: shareUrl() })
  } catch (err: any) {
    // Closing the share sheet is not an error; anything else falls back to the menu.
    if (err?.name !== 'AbortError') menuOpen.value = true
  }
}

async function copyLink() {
  const url = shareUrl()
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    // Older browsers / no clipboard permission
    const field = document.createElement('textarea')
    field.value = url
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    document.execCommand('copy')
    field.remove()
  }
  copied.value = true
  setTimeout(() => { copied.value = false; menuOpen.value = false }, 1200)
}
</script>
