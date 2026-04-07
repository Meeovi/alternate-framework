<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    as?: string | object
    name: string
    show?: boolean
  }>(),
  {
    as: 'div',
    show: true,
  },
)

const shouldRender = computed(() => props.show)
</script>

<template>
  <component :is="as" v-if="shouldRender" v-motion="name">
    <slot />
  </component>
</template>