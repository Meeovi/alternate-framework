<template>
  <div>
    <v-toolbar color="primary" class="mb-4">
      <v-toolbar-title>Integrations</v-toolbar-title>
    </v-toolbar>

    <div class="d-flex flex-wrap align-center ga-3 mb-4">
      <v-btn-toggle v-model="view" mandatory density="comfortable" variant="outlined" color="primary">
        <v-btn value="browse" text="Browse" />
        <v-btn value="installed" :text="`Installed (${installedCount})`" />
      </v-btn-toggle>
      <v-spacer />
      <v-select v-model="type" :items="types" label="Type" density="compact" hide-details clearable class="integrations__filter" />
      <v-text-field v-model="search" label="Search" prepend-inner-icon="fas fa-magnifying-glass" density="compact"
        hide-details clearable class="integrations__search" />
    </div>

    <v-alert v-if="error" type="error" variant="tonal" text="Integrations couldn't be loaded right now. Please try again later." />

    <v-alert v-else-if="!pending && !shown.length" type="info" variant="tonal"
      :text="view === 'installed' && !search && !type ? 'You haven\'t installed any integrations yet.' : 'No integrations match.'" />

    <v-row v-else>
      <v-col v-for="item in shown" :key="item.id" cols="12" sm="6" md="4">
        <v-card elevation="0" border height="100%" class="d-flex flex-column">
          <v-card-item>
            <v-card-title>{{ item.name }}</v-card-title>
            <v-card-subtitle>{{ [item.developer, item.type].filter(Boolean).join(' · ') }}</v-card-subtitle>
          </v-card-item>
          <v-card-text class="flex-grow-1">
            <p class="integrations__description">{{ item.description || 'No description yet.' }}</p>
            <div class="d-flex ga-2 mt-3">
              <v-chip size="small" :color="item.cost === 'paid' ? 'warning' : 'success'" variant="tonal"
                :text="priceLabel(item)" />
              <v-chip v-if="item.version" size="small" variant="tonal" :text="`v${item.version}`" />
            </div>
          </v-card-text>
          <v-card-actions>
            <template v-if="item.state === 'installed'">
              <v-chip color="success" variant="flat" size="small" prepend-icon="fas fa-check" text="Installed" />
              <v-spacer />
              <v-btn variant="text" color="error" text="Uninstall" :loading="busy === item.id" @click="uninstall(item)" />
            </template>
            <v-btn v-else-if="item.state === 'available'" color="primary" variant="flat" text="Install"
              :loading="busy === item.id" @click="install(item)" />
            <v-btn v-else disabled variant="tonal" text="Coming soon" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="toast.show" :color="toast.color" timeout="3500">{{ toast.text }}</v-snackbar>
  </div>
</template>

<script setup lang="ts">
import type { IntegrationCatalogItem, IntegrationCatalogResponse } from '@mframework/meeovi-integrations'

// The catalog lives in Directus `integrations`; installs are per user
// (@mframework/meeovi-integrations), so installing only switches the
// integration on for whoever clicks Install.
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Integrations' })

const route = useRoute()
const { apiBase, install: installIntegration, uninstall: uninstallIntegration } = useIntegrations()

const { data, pending, error, refresh } = await useFetch<IntegrationCatalogResponse>(apiBase, {
  key: 'workspace:integrations',
  default: () => ({ signedIn: false, items: [] }),
})

const items = computed(() => data.value?.items ?? [])
const installedCount = computed(() => items.value.filter((i) => i.state === 'installed').length)
const types = computed(() => [...new Set(items.value.map((i) => i.type).filter(Boolean))].sort() as string[])

const view = ref<'browse' | 'installed'>('browse')
const type = ref<string | null>(null)
const search = ref('')

// Sent here by a plugin page the user hasn't installed (?plugin=…): show it.
const wanted = items.value.find((i) => i.plugin && i.plugin === route.query.plugin)
if (wanted) search.value = wanted.name

// Installable first, then installed, then the rest; alphabetical within.
const ORDER = { available: 0, installed: 1, paid: 2, 'coming-soon': 3 } as const
const shown = computed(() => {
  const q = (search.value || '').trim().toLowerCase()
  return items.value
    .filter((i) => view.value === 'browse' || i.state === 'installed')
    .filter((i) => !type.value || i.type === type.value)
    .filter((i) => !q || [i.name, i.description, i.developer, i.type].some((v) => v?.toLowerCase().includes(q)))
    .sort((a, b) => ORDER[a.state] - ORDER[b.state] || a.name.localeCompare(b.name))
})

const priceLabel = (item: IntegrationCatalogItem) => {
  if (item.cost !== 'paid' && !(Number(item.price) > 0)) return 'Free'
  return Number(item.price) > 0 ? `$${Number(item.price).toFixed(2)}` : 'Paid'
}

const busy = ref<number | null>(null)
const toast = reactive({ show: false, text: '', color: 'success' })
const notify = (text: string, color = 'success') => Object.assign(toast, { show: true, text, color })

async function run(item: IntegrationCatalogItem, action: () => Promise<void>, done: string) {
  busy.value = item.id
  try {
    await action()
    await refresh()
    notify(done)
  } catch (e: any) {
    const status = e?.statusCode ?? e?.status
    notify(status === 401 ? 'Please sign in again.'
      : status === 409 ? `${item.name} can't be installed yet.`
        : 'Something went wrong. Please try again.', 'error')
  } finally {
    busy.value = null
  }
}

const install = (item: IntegrationCatalogItem) => run(item, () => installIntegration(item.id), `${item.name} installed.`)
const uninstall = (item: IntegrationCatalogItem) => run(item, () => uninstallIntegration(item.id), `${item.name} uninstalled.`)
</script>

<style scoped>
.integrations__filter {
  max-width: 200px;
}

.integrations__search {
  max-width: 280px;
}

.integrations__description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
