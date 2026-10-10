<script setup lang="ts">
import Logo from '../../../blocks/workspace/logo.vue'
import NavGroup from './NavGroup.vue'
import NavItem from './NavItem.vue'
import NavCollapse from './NavCollapse.vue'
import type { WorkspaceMenu } from '../../../../composables/useWorkspaceShell'

const { sidebarDrawer, miniSidebar } = useWorkspaceCustomizer()

// Seller pages come from layers/business (/dashboard/*), social pages from
// layers/social, settings from layers/auth.
const sidebarMenu: WorkspaceMenu[] = [
  { header: 'Dashboard' },
  { title: 'Home', icon: 'fas fa-gauge', to: '/' },
  { title: 'Insights', icon: 'fas fa-chart-line', to: '/dashboard/insights' },
  { divider: true },
  { header: 'Manage your Shop' },
  {
    title: 'Sales',
    icon: 'fas fa-cash-register',
    children: [
      { title: 'Orders', to: '/dashboard/orders' },
      { title: 'Shipments', to: '/dashboard/shipments' },
      { title: 'Transactions', to: '/dashboard/transactions' },
      { title: 'Invoices', to: '/dashboard/invoices' },
      { title: 'Payouts', to: '/dashboard/payouts' }
    ]
  },
  {
    title: 'Catalog',
    icon: 'fas fa-boxes-stacked',
    children: [
      { title: 'Products', to: '/dashboard/products' },
      { title: 'Featured Products', to: '/dashboard/featured-products' },
      { title: 'Attributes', to: '/dashboard/attributes' },
      { title: 'Low Stock', to: '/dashboard/low-stock' }
    ]
  },
  {
    title: 'Marketing',
    icon: 'fas fa-bullhorn',
    children: [
      { title: 'Coupons', to: '/dashboard/coupons' },
      { title: 'Announcements', to: '/dashboard/announcements' }
    ]
  },
  { title: 'Reviews', icon: 'fas fa-star', to: '/dashboard/reviews' },
  { title: 'Shop Details', icon: 'fas fa-store', to: '/dashboard/shop' },
  { divider: true },
  { header: 'Social' },
  { title: 'Activity Feed', icon: 'fas fa-rss', to: '/connect/feeds' },
  { title: 'Spaces', icon: 'fas fa-users-rectangle', to: '/dashboard/spaces' },
  { title: 'Lists', icon: 'fas fa-list-check', to: '/lists' },
  { divider: true },
  { title: 'Integrations', icon: 'fas fa-plug', to: '/dashboard/integrations' },
  { title: 'Settings', icon: 'fas fa-gear', to: '/settings' }
]
</script>

<template>
  <v-navigation-drawer
    v-model="sidebarDrawer"
    left
    elevation="0"
    rail-width="75"
    mobile-breakpoint="lg"
    app
    class="leftSidebar"
    :rail="miniSidebar"
    expand-on-hover
  >
    <div class="pa-5">
      <Logo />
    </div>
    <div class="scrollnavbar ws-scroll">
      <v-list class="pa-4">
        <template v-for="(item, i) in sidebarMenu" :key="i">
          <NavGroup v-if="item.header" :item="item" />
          <v-divider v-else-if="item.divider" class="my-3" />
          <NavCollapse v-else-if="item.children" class="leftPadding" :item="item" :level="0" />
          <NavItem v-else :item="item" class="leftPadding" />
        </template>
      </v-list>
    </div>
  </v-navigation-drawer>
</template>
