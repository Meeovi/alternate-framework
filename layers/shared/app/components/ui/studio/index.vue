<template>
  <div class="cnt">
    <div class="cnt-nav">Meeovi Studio</div>
    <div class="cnt-body">
      <div class="editor" ref="editorEl"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from '#imports'
</script>

<style>
body {
  margin: 0;
}
.cnt {
  display: flex;
  flex-direction: column;
  height: 100dvh;
}
.cnt-nav {
  padding: 10px;
  background-color: #020420;
  color: #00dc82;
}
.cnt-body {
  flex-grow: 1;
}
.editor {
  height: 100%;
}
</style>