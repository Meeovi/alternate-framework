<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="contentPage">
    <!-- /workspace/integration: the catalog -->
    <template v-if="!slug">
      <v-toolbar color="primary" class="mb-4">
        <v-toolbar-title>Integrations</v-toolbar-title>
        <v-toolbar-items>
          <v-btn variant="text" prepend-icon="fas fa-store" text="Store" :to="STORE_PATH" />
        </v-toolbar-items>
      </v-toolbar>

      <div class="contentSection">
        <div class="d-flex flex-wrap align-center ga-3 mb-4">
          <v-btn-toggle v-model="view" mandatory density="comfortable" variant="outlined" color="primary">
            <v-btn value="browse" text="Browse" />
            <v-btn value="installed" :text="`Installed (${installedCount})`" />
          </v-btn-toggle>
          <v-spacer />
          <v-select v-model="category" :items="categories" label="Category" density="compact" hide-details clearable
            class="integrations__filter" />
          <v-text-field v-model="search" label="Search" prepend-inner-icon="fas fa-magnifying-glass" density="compact"
            hide-details clearable class="integrations__search" />
        </div>

        <v-alert v-if="catalogError" type="error" variant="tonal"
          text="Integrations couldn't be loaded right now. Please try again later." />

        <v-alert v-else-if="!catalogPending && !shown.length" type="info" variant="tonal"
          :text="view === 'installed' && !search && !category ? 'You haven\'t installed any integrations yet.' : 'No integrations match.'" />

        <v-row v-else>
          <v-col v-for="item in shown" :key="item.slug" cols="12" sm="6" md="4">
            <v-card elevation="0" border height="100%" class="d-flex flex-column" :to="pageOf(item)">
              <v-card-item>
                <template #prepend>
                  <v-avatar color="primary" variant="tonal" rounded>
                    <v-icon :icon="item.icon || 'fas fa-plug'" size="18" />
                  </v-avatar>
                </template>
                <v-card-title>{{ item.name }}</v-card-title>
                <v-card-subtitle>{{ [item.category, item.developer].filter(Boolean).join(' · ') }}</v-card-subtitle>
              </v-card-item>
              <v-card-text class="flex-grow-1">
                <p class="integrations__description">{{ item.description || 'No description yet.' }}</p>
                <div class="d-flex flex-wrap ga-2 mt-3">
                  <v-chip size="small" :color="isPaid(item) && !item.purchased ? 'warning' : 'success'" variant="tonal" :text="priceLabel(item)" />
                  <v-chip v-if="item.admin" size="small" color="secondary" variant="tonal" prepend-icon="fas fa-user-shield"
                    text="Admin" />
                  <v-chip v-if="item.sandboxed" size="small" color="info" variant="tonal" prepend-icon="fas fa-shield-halved"
                    text="Sandboxed" />
                  <v-chip v-if="item.scope === 'site'" size="small" color="warning" variant="tonal" prepend-icon="fas fa-globe"
                    text="Site-wide" />
                  <v-chip v-if="item.version" size="small" variant="tonal" :text="`v${item.version}`" />
                </div>
              </v-card-text>
              <v-card-actions>
                <template v-if="item.state === 'installed'">
                  <v-chip color="success" variant="flat" size="small" prepend-icon="fas fa-check" text="Installed" />
                  <v-spacer />
                  <v-btn variant="text" color="error" text="Uninstall" :loading="busy === item.slug"
                    @click.prevent="uninstall(item)" />
                </template>
                <v-btn v-else-if="item.state === 'available'" color="primary" variant="flat" text="Install"
                  :loading="busy === item.slug" @click.prevent="install(item)" />
                <v-btn v-else-if="item.state === 'paid' && item.productRef" color="warning" variant="flat"
                  prepend-icon="fas fa-cart-shopping" :text="`Buy · ${priceLabel(item)}`"
                  @click.prevent="navigateTo(productPage(item))" />
                <v-btn v-else disabled variant="tonal" :text="blockedLabel(item)" />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </template>

    <!-- /workspace/integration/<slug>: one integration -->
    <template v-else>
      <v-toolbar color="primary" class="mb-4">
        <template #prepend>
          <v-btn icon color="white" variant="text" :to="catalogPath" aria-label="All integrations">
            <v-icon icon="fas fa-arrow-left" size="18" />
          </v-btn>
        </template>
        <v-toolbar-title>{{ integration?.name || 'Integration' }}</v-toolbar-title>
        <v-toolbar-items v-if="integration">
          <v-btn v-if="integration.state === 'installed'" variant="text" text="Uninstall" :loading="busy === integration.slug"
            @click="uninstall(integration)" />
          <v-btn v-else-if="integration.state === 'available'" variant="text" text="Install"
            :loading="busy === integration.slug" @click="install(integration)" />
          <v-btn v-else-if="integration.state === 'paid' && integration.productRef" variant="text"
            :text="`Buy · ${priceLabel(integration)}`" :to="productPage(integration)" />
        </v-toolbar-items>
      </v-toolbar>

      <div class="contentSection">
        <v-alert v-if="itemError" type="info" variant="tonal" text="This integration doesn't exist, or isn't available to you." />

        <v-card v-else-if="integration" elevation="0" border>
          <v-card-item>
            <template #prepend>
              <v-avatar color="primary" variant="tonal" size="56" rounded>
                <v-icon :icon="integration.icon || 'fas fa-plug'" size="26" />
              </v-avatar>
            </template>
            <v-card-title class="text-h5">{{ integration.name }}</v-card-title>
            <v-card-subtitle>
              {{ [integration.category, integration.developer, integration.version && `v${integration.version}`].filter(Boolean).join(' · ') }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <div class="d-flex flex-wrap ga-2 mb-4">
              <v-chip :color="stateColor(integration)" variant="flat" size="small" :text="stateLabel(integration)" />
              <v-chip size="small" :color="isPaid(integration) && !integration.purchased ? 'warning' : 'success'" variant="tonal" :text="priceLabel(integration)" />
              <v-chip v-if="integration.admin" size="small" color="secondary" variant="tonal" prepend-icon="fas fa-user-shield"
                text="Admins only" />
              <v-chip v-if="integration.sandboxed" size="small" color="info" variant="tonal" prepend-icon="fas fa-shield-halved"
                text="Sandboxed" />
            </div>

            <p class="text-body-1">{{ integration.description || 'No description yet.' }}</p>

            <v-alert v-if="integration.state === 'paid'" type="warning" variant="tonal" density="comfortable" class="mt-4"
              icon="fas fa-cart-shopping">
              {{ integration.name }} costs {{ priceLabel(integration) }}. Buy it in the store, and once your payment
              goes through you can install it here.
            </v-alert>

            <v-sheet v-if="integration.plugin" border rounded class="pa-4 mt-4">
              <div class="text-subtitle-2 mb-2">
                <v-icon icon="fas fa-shield-halved" size="16" class="mr-2" />Security
              </div>
              <template v-if="integration.scope === 'site'">
                <p v-if="integration.sandboxed" class="mb-2">
                  Runs in its own locked-down server process. It can't read files, other plugins' data, sessions,
                  passwords or secrets — only what's listed below.
                </p>
                <p v-else class="mb-2">
                  First-party: runs inside the sign-in system with full access.
                </p>
                <ul v-if="integration.permissions.length" class="integrations__permissions mb-2">
                  <li v-for="line in integration.permissions" :key="line">{{ line }}</li>
                </ul>
              </template>
              <p v-else-if="integration.sandboxed" class="mb-2">
                Runs in an isolated sandbox. It can't see your account, your session or the rest of Meeovi — only
                its own data for you, and what the page it's shown on lends it.
              </p>
              <p v-else-if="integration.admin" class="mb-2">
                First-party infrastructure, managed by admins. It runs inside Meeovi, not in the sandbox.
              </p>
              <p v-else class="mb-2">
                Not sandboxed yet — it can't be installed until it runs in the integrations sandbox.
              </p>
              <div class="text-body-2">
                <strong>Outside connections:</strong>
                <template v-if="integration.hosts.length">
                  only
                  <v-chip v-for="host in integration.hosts" :key="host" size="x-small" variant="outlined" class="ml-1"
                    :text="host" />
                </template>
                <template v-else> none.</template>
              </div>
            </v-sheet>

            <v-alert v-if="integration.scope === 'site'" type="warning" variant="tonal" density="comfortable" class="mt-4"
              icon="fas fa-globe">
              Installing turns {{ integration.name }} on for the whole site — every user, straight away. Only admins
              can switch it on or off, and uninstalling takes it away for everyone (its settings are kept).
            </v-alert>

            <v-sheet v-if="integration.scope === 'site' && hasSettings" border rounded class="pa-4 mt-4">
              <div class="text-subtitle-2 mb-3">
                <v-icon icon="fas fa-sliders" size="16" class="mr-2" />Settings
              </div>
              <v-alert v-if="settingsError" type="error" variant="tonal" density="compact" class="mb-3" :text="settingsError" />
              <template v-for="(field, key) in settingsFields" :key="key">
                <v-switch v-if="field.type === 'boolean'" v-model="settingsDraft[key]" :label="field.label" :hint="field.help"
                  persistent-hint color="primary" class="mb-2" />
                <v-select v-else-if="field.type === 'select'" v-model="settingsDraft[key]" :items="field.options" :label="field.label"
                  :hint="field.help" persistent-hint class="mb-2" />
                <v-combobox v-else-if="field.type === 'list'" v-model="settingsDraft[key]" :label="field.label"
                  :hint="field.help || 'Press Enter after each one.'" persistent-hint multiple chips closable-chips class="mb-2" />
                <v-textarea v-else-if="field.type === 'textarea'" v-model="settingsDraft[key]" :label="field.label" :hint="field.help"
                  persistent-hint auto-grow class="mb-2" />
                <v-text-field v-else-if="field.type === 'number'" v-model.number="settingsDraft[key]" type="number" :label="field.label"
                  :hint="field.help" persistent-hint class="mb-2" />
                <v-text-field v-else v-model="settingsDraft[key]" :label="field.label" :hint="field.help" persistent-hint class="mb-2" />
              </template>
              <v-btn color="primary" variant="flat" text="Save settings" :loading="settingsSaving" @click="saveSettings" />
            </v-sheet>

            <v-alert v-if="integration.plugin && integration.scope !== 'site'" type="info" variant="tonal"
              density="comfortable" class="mt-4" icon="fas fa-user-lock">
              Installing turns {{ integration.name }} on for your account only. What you create with it stays attached to
              your account — uninstalling switches it off but keeps your data, and reinstalling brings it back.
            </v-alert>

            <p v-if="integration.installedAt" class="text-medium-emphasis mt-4">
              Installed {{ new Date(integration.installedAt).toLocaleDateString() }}
            </p>
          </v-card-text>

          <v-card-actions>
            <v-btn v-if="integration.state === 'installed'" color="error" variant="tonal" text="Uninstall"
              :loading="busy === integration.slug" @click="uninstall(integration)" />
            <v-btn v-else-if="integration.state === 'available'" color="primary" variant="flat" text="Install"
              :loading="busy === integration.slug" @click="install(integration)" />
            <v-btn v-else-if="integration.state === 'paid' && integration.productRef" color="warning" variant="flat"
              prepend-icon="fas fa-cart-shopping" :text="`Buy · ${priceLabel(integration)}`" :to="productPage(integration)" />
            <v-btn v-else disabled variant="tonal" :text="blockedLabel(integration)" />
            <v-btn v-if="integration.productRef" variant="text" prepend-icon="fas fa-store" text="View in store"
              :to="productPage(integration)" />
            <v-spacer />
            <share />
          </v-card-actions>
        </v-card>
      </div>
    </template>

    <v-snackbar v-model="toast.show" :color="toast.color" timeout="3500">{{ toast.text }}</v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRaw, watch } from 'vue'
import type {
  IntegrationCatalogItem,
  IntegrationCatalogResponse,
  IntegrationDetailResponse,
  IntegrationSettingsResponse,
} from '@mframework/meeovi-integrations'
import share from '#social/app/components/blocks/share.vue'

// Integrations are discovered from the plugins folder and sold (or given
// away) as store products — a paid one installs only after the user bought
// it; installs are per user (@mframework/meeovi-integrations), so
// installing only switches a plugin on for whoever clicks Install. Admin
// plugins are only ever returned to admins.
definePageMeta({ middleware: 'auth', key: (route) => route.fullPath })

const route = useRoute()
const { apiBase, catalogPath, install: installPlugin, uninstall: uninstallPlugin } = useIntegrations()

const slug = computed(() => {
  const parts = ([] as string[]).concat(route.params.slug || []).filter(Boolean)
  return parts.join('/')
})
const pageOf = (item: IntegrationCatalogItem) => `${catalogPath.replace(/\/+$/, '')}/${item.slug}`
// The store's Integrations category, and an integration's product page.
const STORE_PATH = '/departments/category/integrations'
const productPage = (item: IntegrationCatalogItem) => `/product/${encodeURIComponent(item.productRef ?? '')}`

// ---- catalog --------------------------------------------------------------

const { data: catalog, pending: catalogPending, error: catalogError, refresh: refreshCatalog } =
  await useFetch<IntegrationCatalogResponse>(apiBase, {
    key: 'workspace:integrations',
    default: () => ({ signedIn: false, admin: false, items: [] }),
    immediate: !slug.value,
  })

const items = computed(() => catalog.value?.items ?? [])
const installedCount = computed(() => items.value.filter((i) => i.state === 'installed').length)
const categories = computed(() => [...new Set(items.value.map((i) => i.category).filter(Boolean))].sort() as string[])

const view = ref<'browse' | 'installed'>('browse')
const category = ref<string | null>(null)
const search = ref('')

// Installable first, then installed, then the rest; alphabetical within.
const ORDER = { available: 0, installed: 1, paid: 2, 'coming-soon': 3 } as const
const shown = computed(() => {
  const q = (search.value || '').trim().toLowerCase()
  return items.value
    .filter((i) => view.value === 'browse' || i.state === 'installed')
    .filter((i) => !category.value || i.category === category.value)
    .filter((i) => !q || [i.name, i.description, i.developer, i.category].some((v) => v?.toLowerCase().includes(q)))
    .sort((a, b) => ORDER[a.state] - ORDER[b.state] || a.name.localeCompare(b.name))
})

// ---- one integration ------------------------------------------------------

const { data: detail, error: itemError, refresh: refreshItem } = await useFetch<IntegrationDetailResponse>(
  () => `${apiBase}/${encodeURIComponent(slug.value)}`,
  { key: `workspace:integration:${slug.value}`, immediate: !!slug.value },
)
const integration = computed(() => (slug.value ? detail.value?.item : null) ?? null)

const title = computed(() => (slug.value ? integration.value?.name || 'Integration' : 'Integrations'))
useHead({ title })
useSeoMeta({ title, description: () => integration.value?.description || 'Add integrations to your Meeovi workspace.' })

// ---- site plugin settings (admins) ----------------------------------------

const settingsFields = computed(() => integration.value?.settings ?? {})
const hasSettings = computed(() => Object.keys(settingsFields.value).length > 0)
// Field values of any declared type (text, list, boolean, …).
const settingsDraft = reactive<Record<string, any>>({})
const settingsError = ref('')
const settingsSaving = ref(false)
const settingsUrl = computed(() => `${apiBase}/${encodeURIComponent(slug.value)}/settings`)

const { data: settingsData, execute: loadSettings } = await useFetch<IntegrationSettingsResponse>(settingsUrl, {
  key: `workspace:integration-settings:${slug.value}`,
  immediate: false,
})
watch(() => integration.value?.scope === 'site' && hasSettings.value, (load) => {
  if (load) void loadSettings()
}, { immediate: true })
watch(settingsData, (value) => {
  for (const key of Object.keys(settingsDraft)) delete settingsDraft[key]
  Object.assign(settingsDraft, structuredClone(toRaw(value?.values ?? {})))
}, { immediate: true })

async function saveSettings() {
  settingsSaving.value = true
  settingsError.value = ''
  try {
    const saved = await $fetch<IntegrationSettingsResponse>(settingsUrl.value, { method: 'PUT', body: toRaw(settingsDraft) })
    settingsData.value = saved
    notify('Settings saved.')
  } catch (e: any) {
    settingsError.value = e?.data?.statusMessage || e?.statusMessage || 'The settings couldn\'t be saved.'
  } finally {
    settingsSaving.value = false
  }
}

// ---- shared ---------------------------------------------------------------

const isPaid = (item: IntegrationCatalogItem) => item.cost === 'paid' || Number(item.price) > 0
const priceLabel = (item: IntegrationCatalogItem) => {
  if (!isPaid(item)) return 'Free'
  if (item.purchased) return 'Purchased'
  return Number(item.price) > 0 ? `$${Number(item.price).toFixed(2)}` : 'Paid'
}
const blockedLabel = (item: IntegrationCatalogItem) =>
  item.state === 'paid' ? 'Not for sale yet'
    : item.reason === 'not-sandboxed' ? 'Moving to the sandbox'
      : 'Coming soon'
const stateLabel = (item: IntegrationCatalogItem) =>
  ({ installed: 'Installed', available: 'Not installed', paid: 'Paid', 'coming-soon': 'Coming soon' })[item.state]
const stateColor = (item: IntegrationCatalogItem) =>
  ({ installed: 'success', available: 'primary', paid: 'warning', 'coming-soon': 'grey' })[item.state]

const busy = ref<string | null>(null)
const toast = reactive({ show: false, text: '', color: 'success' })
const notify = (text: string, color = 'success') => Object.assign(toast, { show: true, text, color })

async function run(item: IntegrationCatalogItem, action: () => Promise<void>, done: string) {
  busy.value = item.slug
  try {
    await action()
    await Promise.all([slug.value ? refreshItem() : refreshCatalog()])
    notify(done)
  } catch (e: any) {
    const status = e?.statusCode ?? e?.status
    notify(status === 401 ? 'Please sign in again.'
      : status === 402 ? `Buy ${item.name} in the store first.`
      : status === 409 ? `${item.name} can't be installed yet.`
        : 'Something went wrong. Please try again.', 'error')
  } finally {
    busy.value = null
  }
}

const install = (item: IntegrationCatalogItem) =>
  run(item, () => installPlugin(item.plugin!), item.scope === 'site' ? `${item.name} is on for the whole site.` : `${item.name} installed.`)
const uninstall = (item: IntegrationCatalogItem) =>
  run(item, () => uninstallPlugin(item.plugin!), item.scope === 'site'
    ? `${item.name} is off for the whole site. Its settings are kept.`
    : `${item.name} uninstalled. Your data is kept if you reinstall.`)
</script>

<style scoped>
.integrations__filter {
  max-width: 200px;
}

.integrations__search {
  max-width: 280px;
}

.integrations__permissions {
  padding-left: 1.25rem;
}

.integrations__description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
