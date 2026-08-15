<template>
  <Waline id="commentsSection" :serverURL="serverURL" :path="path" :reaction="true" :pageView="true" :comment="true" :noCopyright="true" :turnstileKey="true" />
</template>

<script setup>
import { Waline } from '@waline/client/component'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import '@waline/client/style'
import '@waline/client/meta'

const serverURL = useRuntimeConfig().public.walineServerURL

const props = defineProps({
  commentId: {
    type: String,
    required: false,
    default: undefined
  }
})

// commentId was previously declared but never actually used — path always
// fell back to the page route, so every embedded thread on the same page
// (e.g. one per card in a feed) collided into a single shared thread
// instead of each having its own. Falls back to the route path for
// callers that render exactly one thread per page (station, bookmark).
const path = computed(() => props.commentId ? `/${props.commentId}` : useRoute().path)

</script>