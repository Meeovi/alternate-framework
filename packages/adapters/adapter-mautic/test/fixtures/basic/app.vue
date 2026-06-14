<template>
  <div>{{ status }}</div>
</template>

<script setup>
const mautic = useMautic()

const status = computed(() => mautic.apiBaseUrl ? 'mautic-ready' : 'mautic-missing')
</script>
