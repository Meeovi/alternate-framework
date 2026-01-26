<template>
    <div>
        <!-- ShareThis BEGIN -->
         <div class="sharethis-inline-reaction-buttons"></div>
         <!-- ShareThis END -->
    </div>
</template>

<script setup>
import { onMounted } from 'vue'

const props = defineProps({
  contentId: {
    type: [String, Number],
    required: false,
  },
  contentType: {
    type: String,
    required: false,
  },
})

const config = useRuntimeConfig()
const projectId =
  config?.public?.NUXT_PROJECT_ID ?? process.env.NUXT_PROJECT_ID ?? ''

onMounted(() => {
  const st = window.__sharethis__
  if (!st) {
    if (!projectId) {
      console.warn('ShareThis property (NUXT_PROJECT_ID) is not set in runtime config or env')
    }
    const script = document.createElement('script')
    const encoded = encodeURIComponent(projectId)
    script.src = `https://platform-api.sharethis.com/js/sharethis.js#property=${encoded}&product=sticky-share-buttons`
    document.body.appendChild(script)
  } else if (typeof st.initialize === 'function') {
    st.href = window.location.href
    st.initialize()
  }
})
</script>