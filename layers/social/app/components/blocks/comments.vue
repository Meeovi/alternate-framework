<template>
  <div class="comments-embed">
    <client-only>
        <component v-if="disqusComponent && channelName" :is="disqusComponent"
          :shortname="shortname"
          :identifier="identifier"
          :title="title"
          :url="url"
        />

        <iframe v-else-if="commentsStore.iframeUrl" :src="commentsStore.iframeUrl" width="100%" :height="height"
          frameborder="0" allow="camera; microphone; fullscreen"></iframe>

        <p v-else>Loading comments...</p>
      </client-only>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    onMounted,
    ref
  } from 'vue'
  import {
    useCommentsStore
  } from 
  '../../stores/useCommentsStore'

  const props = defineProps({
    contentId: {
      type: [String, Number, Object],
      required: true
    },
    height: {
      type: String,
      default: '600px'
    }
  })

  const commentsStore = useCommentsStore()

  // Load channel information (server ensures Rocket.Chat channel exists)
  onMounted(() => {
    // props may be an object or primitive id; pass through as-is
    commentsStore.loadChannel(props.contentId)
  })
  const channelName = computed(() => commentsStore.channelName)

  const config = useRuntimeConfig()
  const shortname = config.public?.disqus?.shortname || 'your_shortname_disqus'
  const identifier = computed(() => String(props.contentId))
  const title = computed(() => (channelName.value ? `Comments: ${channelName.value}` : `Comments: ${identifier.value}`))
  const url = computed(() => (typeof window !== 'undefined' ? window.location.href : ''))

  // lazy-load `vue-disqus` component at runtime; fallback to iframe if unavailable
  const disqusComponent = ref(null)
  onMounted(async () => {
    try {
      // Dynamically import the component module using a non-literal specifier
      // so the bundler won't attempt to resolve it at build time.
      // @ts-ignore
      const pkg = 'vue-disqus'
      const mod = await import(/* @vite-ignore */ pkg)
      disqusComponent.value = mod?.default || mod
    } catch (e) {
      disqusComponent.value = null
    }
  })
</script>

<style scoped>
  .comments-embed {
    margin-top: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }
</style>