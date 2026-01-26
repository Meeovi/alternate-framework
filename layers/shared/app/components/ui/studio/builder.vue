<template>
  <div class="cnt">
    <div class="cnt-nav">Meeovi Studio</div>
    <div class="cnt-body">
      <div class="editor" ref="editorEl"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import createStudioEditor from '@grapesjs/studio-sdk';
import '@grapesjs/studio-sdk/dist/style.css';

const editorEl = ref(null);

onMounted(() => {
  createStudioEditor({
    root: editorEl.value,
    plugins: [(editor) => console.log('editor created!', editor)],
    licenseKey: 'YOUR_LICENSE_KEY',
    project: {
      default: {
        pages: [
          {
            name: 'Home',
            component: `<h1 style="padding: 2rem; text-align: center">
              Hello Studio 👋
            </h1>`,
          },
        ],
      },
    },
  });
});
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