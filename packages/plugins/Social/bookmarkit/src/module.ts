import { addComponent, addImportsDir, addServerHandler, createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'
import type { BookmarkitModuleOptions } from './runtime/types'

export type { BookmarkitModuleOptions } from './runtime/types'
export * from './runtime/types'

export default defineNuxtModule<BookmarkitModuleOptions>({
  meta: {
    name: 'bookmarkit',
    configKey: 'bookmarkit',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  defaults: {
    enabled: true,
    apiBase: '/api/bookmarks',
    page: '/bookmarks',
    listType: 'Bookmarks',
    sessionEndpoint: '/api/auth/get-session',
    loginPath: '/login',
    directus: { url: '', token: '' },
  },

  setup(options, nuxt) {
    if (options.enabled === false) return
    const resolver = createResolver(import.meta.url)
    const apiBase = (options.apiBase || '/api/bookmarks').replace(/\/+$/, '')

    // Global, so a page can render it only when the module is installed:
    // resolveComponent('Bookmarkit').
    addComponent({ name: 'Bookmarkit', filePath: resolver.resolve('runtime/components/Bookmarkit.vue'), global: true })
    addImportsDir(resolver.resolve('runtime/composables'))

    if (options.page) {
      const path = options.page
      extendPages((pages) => {
        pages.push({ name: 'bookmarkit', path, file: resolver.resolve('runtime/pages/bookmarks.vue') })
      })
    }

    const route = (path: string, method: 'get' | 'post' | 'patch' | 'delete', file: string) =>
      addServerHandler({ route: `${apiBase}${path}`, method, handler: resolver.resolve(`runtime/server/api/${file}`) })
    route('', 'get', 'index.get')
    route('', 'post', 'index.post')
    route('/folders', 'post', 'folders.post')
    route('/folders/:id', 'patch', 'folder.patch')
    route('/folders/:id', 'delete', 'folder.delete')
    route('/:id', 'patch', 'bookmark.patch')
    route('/:id', 'delete', 'bookmark.delete')

    // Private: the Directus token never reaches the client bundle. Nothing
    // is read from the environment at build time, so a rotated token only
    // needs a restart.
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.bookmarkit = {
      ...(runtimeConfig.bookmarkit as Record<string, unknown> || {}),
      listType: options.listType || 'Bookmarks',
      sessionEndpoint: options.sessionEndpoint || '/api/auth/get-session',
      directus: { url: options.directus?.url || '', token: options.directus?.token || '' },
    }
    nuxt.options.runtimeConfig.public.bookmarkit = {
      ...(nuxt.options.runtimeConfig.public.bookmarkit as Record<string, unknown> || {}),
      apiBase,
      page: options.page || false,
      loginPath: options.loginPath || '/login',
    }
  },
})
