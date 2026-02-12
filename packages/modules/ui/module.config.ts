import {
  defineNuxtModuleConfig
} from '@nuxt/module-builder'

export default defineNuxtModuleConfig({
  // Your module entry
  entries: [{
    input: 'src/module.ts',
    name: 'module'
  }],

  // Do not fail builds because of warnings (Sass, deprecated fields, etc.)
  failOnWarn: false,
  clean: true,
  declaration: true,
  cjs: false,

  // ⭐ IMPORTANT: copy all runtime files including SCSS
  outDir: 'dist',
  rootDir: '.',

  // This ensures SCSS, CSS, images, etc. are copied
  // ⭐ CRITICAL: copy SCSS files into dist
  assets: {
    include: [
      'src/runtime/**/*.{scss,css,js,ts,vue,json}'
    ]
  },

  // Externals prevent bundling dependencies that should come from the host app
  externals: [
    'vue',
    'nuxt',
    'vuetify',
    '@vueuse/motion',
    '@formkit/vue',
    '@fortawesome/vue-fontawesome',
    '@grapesjs/studio-sdk',
    'grapesjs'
  ],

  // Enable a local playground for testing the module
  playground: {
    enabled: true,
    // Optional: point to a custom playground folder
    // path: './playground'
  },

  // Ensure runtime directory is copied correctly
  rollup: {
    inlineDependencies: false,
    emitCJS: false
  }
})