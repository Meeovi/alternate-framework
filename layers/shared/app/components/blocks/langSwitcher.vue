<template>
  <div>
    <div class="gtranslate_wrapper"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

useHead({
  script: [
    {
      src: 'https://cdn.gtranslate.net/widgets/latest/float.js',
      defer: true
    }
  ]
})

onMounted(() => {
  // Set window settings safely after mounting in the DOM
  window.gtranslateSettings = {
    default_language: 'en',
    native_language_names: true,
    detect_browser_language: true,
    wrapper_selector: '.gtranslate_wrapper',
    switcher_horizontal_position: 'inline'
  }
})
</script>