<template>
  <!-- Grid tiles stay icon-based (no server-side 3D thumbnailing); opening
       a glTF/glb tile renders it live in <Pix3DViewer> (three.js via
       @tresjs/nuxt). Other 3D formats fall back to a download link. -->
  <PixCategorySection category="3d" />
</template>

<script setup>
import PixCategorySection from '../../pixanomy/PixCategorySection.vue'
</script>
