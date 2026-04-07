<script setup lang="ts">
import { ref } from 'vue'

const pullDownThreshold = ref(64)
const emit = defineEmits<{
  refresh: []
}>()

function onLoad({ done }: { done: () => void }) {
  emit('refresh')
  done()
}
</script>

<template>
  <v-pull-to-refresh @load="onLoad" v-bind="$attrs" :pull-down-threshold="pullDownThreshold">
    <slot>
      <div class="default-content">Pull down to refresh.</div>
    </slot>
  </v-pull-to-refresh>
</template>

<style scoped>
.default-content {
  padding: 1rem;
}
</style>
