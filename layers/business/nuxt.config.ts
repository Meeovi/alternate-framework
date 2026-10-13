import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { NuxtPage } from 'nuxt/schema'
import { defineNuxtConfig } from 'nuxt/config'

const workspacePages = fileURLToPath(new URL('./app/pages/workspace', import.meta.url))

// /workspace/** pages render in ui-shell's `workspace` layout (the admin
// sidebar) in every app that uses this layer, unless the page picks its own
// layout with definePageMeta. (Meta set here would override definePageMeta,
// so pages that name a layout are left alone.)
function useWorkspaceLayout(pages: NuxtPage[]) {
  for (const page of pages) {
    if (page.file?.startsWith(workspacePages) && !page.meta?.layout) {
      let source = ''
      try { source = readFileSync(page.file, 'utf8') } catch {}
      if (!/\blayout\s*:/.test(source)) page.meta = { ...page.meta, layout: 'workspace' }
    }
    if (page.children?.length) useWorkspaceLayout(page.children)
  }
}

export default defineNuxtConfig({
  modules: [],

  hooks: {
    'pages:extend': useWorkspaceLayout,
  },

  // The workspace pages used to live at the root (and in the auth layer);
  // keep old links, bookmarks and emails working.
  routeRules: {
    '/settings': { redirect: '/workspace/settings' },
    '/settings/**': { redirect: '/workspace/settings/**' },
    '/account': { redirect: '/workspace/account' },
    '/security': { redirect: '/workspace/security' },
    '/security/**': { redirect: '/workspace/security/**' },
    '/oauth/consent': { redirect: '/workspace/oauth/consent' },
    '/dashboard': { redirect: '/workspace' },
    '/dashboard/integrations': { redirect: '/workspace/dashboard/integrations' },
    '/dashboard/integration/**': { redirect: '/workspace/integration/**' },
    '/dashboard/insights': { redirect: '/workspace/reports/reports' },
    '/dashboard/orders': { redirect: '/workspace/sales/orders' },
    '/dashboard/shipments': { redirect: '/workspace/sales/shipments' },
    '/dashboard/transactions': { redirect: '/workspace/sales/transactions' },
    '/dashboard/invoices': { redirect: '/workspace/sales/invoices' },
    '/dashboard/payouts': { redirect: '/workspace/sales/payments' },
    '/dashboard/products': { redirect: '/workspace/catalog/products' },
    '/dashboard/featured-products': { redirect: '/workspace/catalog/products' },
    '/dashboard/low-stock': { redirect: '/workspace/catalog/products' },
    '/dashboard/attributes': { redirect: '/workspace/stores/product-attributes' },
    '/dashboard/coupons': { redirect: '/workspace/marketing/promotions' },
    '/dashboard/announcements': { redirect: '/workspace/reports/manage-news' },
    '/dashboard/reviews': { redirect: '/workspace/marketing/reviews' },
    '/dashboard/shop': { redirect: '/workspace/system/shop' },
    '/dashboard/spaces': { redirect: '/workspace/content/manage-spaces' },
  },

  $meta: {
    description: 'Business Layer provides functionalities for business operations and services.',
    name: 'business'
  },

  runtimeConfig: {
    public: {}
  },

  build: {
    // @svar-ui/vue-grid ships as ESM but needs transpiling through Nuxt's
    // build pipeline the same way layers/shared does for its own svar-ui
    // usage — without this the seller dashboard grids fail to build.
    transpile: [
      '@svar-ui/vue-grid',
      '@svar-ui/vue-core'
    ]
  },

  compatibilityDate: '2026-02-16'
})
