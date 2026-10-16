import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Builds the sandboxed UI (../sandbox/app.js + app.css) from this folder:
 *   npm run build:sandbox
 * One classic script, no chunks (the sandbox is an opaque origin, so module
 * scripts would need CORS), fonts inlined as data: URIs (its CSP allows
 * font-src data:). ../sandbox/index.html is hand-written and kept.
 */
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()],
  define: {
    'process.env.NODE_ENV': '"production"',
    __VUE_OPTIONS_API__: 'false',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  build: {
    outDir: fileURLToPath(new URL('../sandbox', import.meta.url)),
    emptyOutDir: false,
    assetsInlineLimit: 200_000,
    lib: {
      entry: fileURLToPath(new URL('./main.ts', import.meta.url)),
      formats: ['iife'],
      name: 'MeeoviKanban',
      fileName: () => 'app.js',
      cssFileName: 'app',
    },
  },
})
