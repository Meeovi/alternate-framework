<template>
  <div>
    {{ status }}
  </div>
</template>

<script setup>
const mautic = useMautic()

const status = computed(() => mautic.apiBaseUrl ? 'Mautic module ready' : 'Mautic module missing')
</script>
