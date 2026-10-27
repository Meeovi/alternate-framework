import { addComponent, addImportsDir, addServerHandler, createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'
import type { MeeoviGalleryModuleOptions } from './runtime/types'

export type { MeeoviGalleryModuleOptions } from './runtime/types'
export * from './runtime/types'

export default defineNuxtModule<MeeoviGalleryModuleOptions>({
  meta: {
    name: 'meeovi-gallery',
    configKey: 'meeoviGallery',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  defaults: {
    enabled: true,
    apiBase: '/api/gallery',
    page: '/connect/media',
    uploadEndpoint: '/api/assets/upload',
    uploadCategory: 'gallery',
    sessionEndpoint: '/api/auth/get-session',
    loginPath: '/login',
    pixanomy: { url: '', username: '', appPassword: '', root: '' },
  },

  setup(options, nuxt) {
    if (options.enabled === false) return
    const resolver = createResolver(import.meta.url)
    const apiBase = (options.apiBase || '/api/gallery').replace(/\/+$/, '')

    // Global, so any page or layer can use them without importing, and can
    // check they're installed with resolveComponent('MeeoviGallery').
    //   <MeeoviGallery />          the user's uploads in SVAR File Manager
    //   <MeeoviRelatedMedia />     a slider of their latest photos/videos
    addComponent({ name: 'MeeoviGallery', filePath: resolver.resolve('runtime/components/MeeoviGallery.vue'), global: true })
    addComponent({ name: 'MeeoviRelatedMedia', filePath: resolver.resolve('runtime/components/MeeoviRelatedMedia.vue'), global: true })
    addComponent({ name: 'MeeoviMediaViewer', filePath: resolver.resolve('runtime/components/MeeoviMediaViewer.vue'), global: true })
    addImportsDir(resolver.resolve('runtime/composables'))

    // SVAR ships ESM that the server build must bundle, not externalize — see
    // meeovi-tables: an externalized nested @svar-ui dependency 500s the
    // production server ("Cannot find module …/core-locales/…").
    nuxt.options.build.transpile.push(/@svar-ui\//)

    if (options.page) {
      const path = options.page
      extendPages((pages) => {
        pages.push({ name: 'meeovi-gallery', path, file: resolver.resolve('runtime/pages/media.vue') })
      })
    }

    addServerHandler({ route: `${apiBase}/files`, method: 'get', handler: resolver.resolve('runtime/server/api/files.get') })
    addServerHandler({ route: `${apiBase}/recent`, method: 'get', handler: resolver.resolve('runtime/server/api/recent.get') })

    // Private: Pixanomy credentials never reach the client bundle. Nothing
    // is read from the environment at build time, so rotated credentials
    // only need a restart.
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.meeoviGallery = {
      ...(runtimeConfig.meeoviGallery as Record<string, unknown> || {}),
      sessionEndpoint: options.sessionEndpoint || '/api/auth/get-session',
      pixanomy: {
        url: options.pixanomy?.url || '',
        username: options.pixanomy?.username || '',
        appPassword: options.pixanomy?.appPassword || '',
        root: options.pixanomy?.root || '',
      },
    }
    nuxt.options.runtimeConfig.public.meeoviGallery = {
      ...(nuxt.options.runtimeConfig.public.meeoviGallery as Record<string, unknown> || {}),
      apiBase,
      page: options.page || false,
      uploadEndpoint: options.uploadEndpoint || '/api/assets/upload',
      uploadCategory: options.uploadCategory || 'gallery',
      loginPath: options.loginPath || '/login',
    }
  },
})
