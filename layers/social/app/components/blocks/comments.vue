<template>
  <Waline :serverURL="serverURL" :path="path" :reaction="true" :pageView="true" :comment="true" :noCopyright="true" :turnstileKey="true" />
</template>

<script setup>
import { Waline } from '@waline/client/component'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import '@waline/client/style'
import '@waline/client/meta'

const serverURL = useRuntimeConfig().public.walineServerURL
const path = computed(() => useRoute().path)

defineProps({
  commentId: {
    type: String,
    required: true
  }
})

</script>