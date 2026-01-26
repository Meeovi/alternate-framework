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
  import { presetPrintable, canvasFullSize } from '@grapesjs/studio-sdk-plugins';

  const editorEl = ref(null);

  onMounted(() => {
    createStudioEditor({
      root: editorEl.value,
      plugins: [
        presetPrintable,
        canvasFullSize, // Optional
      ],
      licenseKey: 'YOUR_LICENSE_KEY',
      project: {
        type: 'document', // Ensure the project type is set to 'document'
        default: {
          pages: [{
            name: 'Invoice',
            component: `<!DOCTYPE html>
                <html>
                  <body style="padding: 40px; font-family: Arial, Helvetica, sans-serif">
                    <h1>New Document</h1>
                    <p>Content of the document.</p>
                  </body>
                <html>
              `,
          }],
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