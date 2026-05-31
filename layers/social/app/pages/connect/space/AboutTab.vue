<template>
  <div>
    <AboutSpace :group="space" />
  </div>
</template>
<script setup>
defineProps({ space: Object })
import AboutSpace from '#social/app/components/blocks/groups/about.vue'
</script>
