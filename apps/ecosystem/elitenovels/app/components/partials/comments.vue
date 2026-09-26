<template>
  <div>
    <div v-if="enabled" id="disqus_thread"></div>
    <div v-else class="disqus-placeholder text-center">
      <h4>Comments are available when your site is online</h4>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  shortname: {
    type: String,
    optional: true
  },
  identifier: {
    type: String,
    optional: true
  },
  url: {
    type: String,
    optional: true
  },
  title: {
    type: String,
    default: ''
  },
  enabled: {
    type: Boolean,
    default: true
  }
})

const scriptId = `disqus-script-${props.shortname}`
const running = ref(false)

function addDisqusScript() {
  if (document.getElementById(scriptId)) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.id = scriptId
    s.src = `https://${props.shortname}.disqus.com/embed.js`
    s.async = true
    s.setAttribute('data-timestamp', Date.now().toString())
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Disqus script'))
    document.head.appendChild(s)
  })
}

async function resetDisqus() {
  if (!props.enabled) return
  if (typeof window === 'undefined') return
  if (!props.identifier || !props.url) return

  // Define Disqus config function
  window.disqus_config = function () {
    this.page.identifier = props.identifier
    this.page.url = props.url
    this.page.title = props.title
  }

  // If Disqus already loaded, reset instead of reloading script
  if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
    const thread = document.getElementById('disqus_thread')
    if (thread) thread.innerHTML = '' // clear old thread first

    window.DISQUS.reset({
      reload: true,
      config: window.disqus_config
    })
    running.value = true
    return
  }

  // Otherwise, load Disqus script for the first time
  try {
    await addDisqusScript()
    running.value = true
  } catch (err) {
    console.error('Disqus load error:', err)
  }
}

onMounted(async () => {
  if (!props.enabled) return
  await nextTick()
  resetDisqus()
})

// Watch props and reload when identifier, URL, or title change
watch(
  () => [props.identifier, props.url, props.title, props.enabled],
  async ([identifier, url, title, enabled]) => {
    if (!enabled || !identifier || !url) return
    await nextTick()
    // small delay to ensure DOM stability
    setTimeout(() => resetDisqus(), 100)
  }
)

onBeforeUnmount(() => {
  const el = document.getElementById('disqus_thread')
  if (el) el.innerHTML = ''
})
</script>

<style scoped>
.disqus-placeholder {
  padding: 2rem 0;
  color: #666;
  text-align: center;
}
</style>
