import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { NuxtPage } from 'nuxt/schema'
import { defineNuxtConfig } from 'nuxt/config'

const workspacePages = fileURLToPath(new URL('./app/pages/workspace', import.meta.url))

// Tables on the /workspace pages (@mframework/meeovi-tables, registered by
// the app): only these collections are readable, with these roles. Also
// used below to role-gate the pages that render them.
const tableCollections: Record<string, { roles?: string[], [key: string]: unknown }> = (() => {
  // Admins read and create/edit/delete everything (all rows); sellers
  // may read the catalog. `fallback: false` = commerce data that only an
  // installed commerce adapter (adapter-magento, …) may provide — the
  // table shows a notice until one does.
  const admin = { roles: ['admin'], editRoles: ['admin'] }
  const catalog = { roles: ['admin', 'seller'], editRoles: ['admin'] }
  const adapterOnly = { ...admin, fallback: false }
  return {
    // Sales — /workspace/sales/*
    orders: { label: 'Orders', ...admin, sort: '-id' },
    invoices: { label: 'Invoices', ...admin, sort: '-id' },
    transactions: { label: 'Transactions', ...admin, sort: '-id' },
    payments: { label: 'Payments', ...admin, sort: '-id' },
    shipments: { label: 'Shipments', ...adapterOnly },
    creditmemos: { label: 'Credit Memos', ...adapterOnly },
    billingagreements: { label: 'Billing Agreements', ...adapterOnly },
    // Catalog — /workspace/catalog/*
    products: { label: 'Products', ...catalog, sort: 'name' },
    giftcards: { label: 'Gift Cards', ...adapterOnly },
    brands: { label: 'Brands', ...catalog, sort: 'name' },
    departments: { label: 'Departments', ...catalog, sort: 'name' },
    categories: { label: 'Categories', ...catalog, sort: 'name' },
    attributes: { label: 'Attributes', ...catalog },
    // Content — /workspace/content/*
    pages: { label: 'Pages', ...admin },
    posts: { label: 'Posts', ...admin },
    spaces: { label: 'Spaces', ...admin },
    lists: { label: 'Lists', ...admin },
    tags: { label: 'Tags', ...admin },
    // Users manage their own (`owner` = better-auth user id, stamped by
    // the server; admins see everyone's). The frontends stay in
    // layers/social (/connect/vibez, /connect/radio, /connect/memories).
    vibez: {
      label: 'Vibez', collection: 'shorts', owner: 'creator_id', ownerName: 'creator', sort: '-date_created',
      fields: ['id', 'name', 'description', 'type', 'status', 'video_url', 'thumbnail_url', 'duration',
        'dateTime', 'age_requirement', 'region', 'creator', 'views', 'date_created'],
      readonlyFields: ['views'],
    },
    radio_stations: {
      label: 'Radio Stations', collection: 'radios', owner: 'creator_id', ownerName: 'creator', sort: 'name',
      fields: ['id', 'name', 'slug', 'status', 'type', 'format', 'satellite', 'internet', 'description', 'creator', 'date_created'],
    },
    // Memories = the user's past posts (Bluesky ones are listed, read-only,
    // on the page itself).
    memories: {
      label: 'Memories', collection: 'posts', owner: 'creator_id', sort: '-date_created',
      filter: { date_created: { _lt: '$NOW' } },
      fields: ['id', 'title', 'content', 'summary', 'status', 'content_type', 'visibility_scope',
        'target_audience', 'date_published', 'views', 'date_created'],
      readonlyFields: ['views'],
      // NOT NULL on posts, not shown in the form
      defaults: { gallery: [] },
    },
    // Customers — /workspace/customers/*
    customers: { label: 'Customers', ...adapterOnly },
    online_customers: { label: 'Now Online', ...adapterOnly, unavailableNotice: 'No customers online right now.' },
    customer_groups: { label: 'Customer Groups', ...adapterOnly },
    // Marketing — /workspace/marketing/*
    newsletters: { label: 'Newsletters', ...admin },
    promotions: { label: 'Promotions', ...adapterOnly },
    // Seller reviews = messages in product / outlet live discussions
    // (Rocket.Chat; server/plugins/discussion-reviews.ts); read-only.
    reviews: { label: 'Reviews', roles: ['admin'], fallback: false, sort: '-date' },
    // Reports — /workspace/reports/*
    // Directus `report` collection (user feedback / reports)
    report: { label: 'Feedback', ...admin, sort: '-date_created' },
    // Stores — /workspace/stores/*
    product_attributes: { label: 'Product Attributes', ...catalog },
    warehouses: { label: 'Warehouses', ...adapterOnly },
    sources: { label: 'Inventory Sources', ...adapterOnly },
    terms: { label: 'Terms and Conditions', ...adapterOnly },
  }
})()

// /workspace/** pages render in ui-shell's `workspace` layout (the admin
// sidebar) in every app that uses this layer, unless the page picks its own
// layout with definePageMeta. (Meta set here would override definePageMeta,
// so pages that name a layout are left alone.)
//
// Likewise every /workspace/** page requires a signed-in user: pages that
// don't declare middleware get the auth layer's `auth` middleware (several —
// order/invoice/shipment details, account, security, settings — had none,
// so signed-out visitors could open them). Pages that declare their own
// (e.g. `seller`, which also requires a session) are left alone, since this
// would override it.
// Pages rendering MeeoviTables get the same roles the tables' data needs
// (`meta.roles`, enforced by the auth layer's `auth` middleware) — otherwise
// every signed-in user can open e.g. /workspace/customers and just sees
// "forbidden" tables. A page whose tables include one without roles (a
// user's own vibez/radio/memories) stays open to any signed-in user.
function pageTableRoles(source: string): string[] | null {
  const names = [...source.matchAll(/\bcollection(?:="|:\s*')([a-z_]+)["']/g)].map((m) => m[1]!)
  const tables = names.map((n) => tableCollections[n]).filter(Boolean)
  if (!tables.length || tables.some((t) => !t!.roles?.length)) return null
  return [...new Set(tables.flatMap((t) => t!.roles!))]
}

function useWorkspaceLayout(pages: NuxtPage[]) {
  for (const page of pages) {
    if (page.file?.startsWith(workspacePages)) {
      let source = ''
      try { source = readFileSync(page.file, 'utf8') } catch {}
      if (!page.meta?.layout && !/\blayout\s*:/.test(source)) page.meta = { ...page.meta, layout: 'workspace' }
      const roles = pageTableRoles(source)
      if (roles) page.meta = { ...page.meta, middleware: ['auth'], roles }
      else if (!page.meta?.middleware && !/\bmiddleware\s*:/.test(source)) page.meta = { ...page.meta, middleware: ['auth'] }
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
    '/dashboard/integrations': { redirect: '/workspace/integration' },
    '/workspace/dashboard/integrations': { redirect: '/workspace/integration' },
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

  // Tables on the /workspace pages (@mframework/meeovi-tables, registered by
  // the app): only these collections are readable, with these roles.
  meeoviTables: {
    collections: tableCollections,
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
