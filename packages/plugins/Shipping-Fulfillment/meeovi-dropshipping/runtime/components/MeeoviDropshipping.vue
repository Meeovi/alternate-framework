<template>
  <div class="meeovi-dropshipping">
    <v-toolbar density="comfortable" color="surface">
      <v-toolbar-title>Suppliers</v-toolbar-title>
      <v-spacer />
      <v-btn color="primary" variant="flat" prepend-icon="fas fa-plug" @click="connectOpen = true">Connect a supplier</v-btn>
    </v-toolbar>

    <v-alert v-if="pageError" type="error" variant="tonal" class="ma-4">{{ pageError }}</v-alert>

    <v-tabs v-model="tab" class="px-4">
      <v-tab value="import">Import products</v-tab>
      <v-tab value="products">Imported ({{ products.length }})</v-tab>
      <v-tab value="orders">Orders ({{ orders.length }})</v-tab>
      <v-tab value="connections">Connections ({{ connections.length }})</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="pa-4">
      <!-- Import -->
      <v-window-item value="import">
        <p v-if="!connections.length" class="text-medium-emphasis">
          Connect your Printful or CJdropshipping account first. Products you import are listed under your seller account.
        </p>
        <template v-else>
          <v-row dense>
            <v-col cols="12" md="4">
              <v-select v-model="connectionId" :items="connections" item-title="label" item-value="id" label="Supplier" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="5">
              <v-text-field v-model="search" label="Search" variant="outlined" density="comfortable" clearable
                append-inner-icon="fas fa-magnifying-glass" @keyup.enter="loadCatalog(1)" @click:append-inner="loadCatalog(1)" />
            </v-col>
          </v-row>

          <v-row v-if="currentProvider === 'cj'" dense class="mb-2">
            <v-col cols="6" md="2">
              <v-select v-model="markup.type" :items="[{ title: 'Percent', value: 'percent' }, { title: 'Fixed amount', value: 'fixed' }]" label="Markup" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="6" md="2">
              <v-text-field v-model.number="markup.value" type="number" min="0" :suffix="markup.type === 'percent' ? '%' : 'USD'" label="Amount" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="3">
              <v-checkbox v-model="markup.charmPricing" label="Round to .99" density="comfortable" hide-details />
            </v-col>
          </v-row>
          <p v-else-if="currentProvider === 'printful'" class="text-caption text-medium-emphasis mb-2">
            Printful products use the retail prices you set in Printful.
          </p>

          <v-progress-linear v-if="catalogLoading" indeterminate class="mb-2" />
          <v-row>
            <v-col v-for="item in catalog" :key="item.id" cols="6" sm="4" md="3" lg="2">
              <v-card :variant="selected.includes(item.id) ? 'tonal' : 'outlined'" :color="selected.includes(item.id) ? 'primary' : undefined" @click="toggle(item.id)">
                <v-img :src="item.image || undefined" aspect-ratio="1" cover />
                <v-card-text class="pa-2">
                  <div class="text-body-2 text-truncate" :title="item.name">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    <span v-if="item.price !== null">${{ item.price.toFixed(2) }}</span>
                    <span v-if="item.variants"> · {{ item.variants }} variants</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <div class="d-flex align-center ga-2 mt-4">
            <v-btn :disabled="page <= 1 || catalogLoading" variant="text" @click="loadCatalog(page - 1)">Previous</v-btn>
            <span class="text-caption">Page {{ page }}</span>
            <v-btn :disabled="!hasMore || catalogLoading" variant="text" @click="loadCatalog(page + 1)">Next</v-btn>
            <v-spacer />
            <v-btn color="primary" :disabled="!selected.length || selected.length > 10" :loading="importing" @click="importSelected">
              Import {{ selected.length || '' }} {{ selected.length === 1 ? 'product' : 'products' }}
            </v-btn>
          </div>
          <v-alert v-if="importSummary" :type="importSummary.errors ? 'warning' : 'success'" variant="tonal" class="mt-4">
            {{ importSummary.text }}
            <ul v-if="importSummary.details.length" class="mt-2 text-caption">
              <li v-for="line in importSummary.details" :key="line">{{ line }}</li>
            </ul>
          </v-alert>
        </template>
      </v-window-item>

      <!-- Imported products -->
      <v-window-item value="products">
        <v-table density="comfortable">
          <thead>
            <tr><th>Product</th><th>SKU</th><th>Cost</th><th>Price</th><th>Stock</th><th>Status</th><th>Synced</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td>{{ p.name }}</td>
              <td class="text-caption">{{ p.sku }}</td>
              <td>{{ p.cost === null ? '—' : `$${p.cost.toFixed(2)}` }}</td>
              <td>${{ p.price.toFixed(2) }}</td>
              <td>{{ p.stock === null ? 'On demand' : p.stock }}</td>
              <td><v-chip size="small" :color="statusColor(p.status)" :title="p.lastError || undefined">{{ p.status.replace('_', ' ') }}</v-chip></td>
              <td class="text-caption">{{ p.lastSynced ? new Date(p.lastSynced).toLocaleString() : '—' }}</td>
            </tr>
            <tr v-if="!products.length"><td colspan="7" class="text-medium-emphasis">Nothing imported yet.</td></tr>
          </tbody>
        </v-table>
      </v-window-item>

      <!-- Orders -->
      <v-window-item value="orders">
        <p class="text-caption text-medium-emphasis mb-2">
          Paid orders containing your supplier products are sent to the supplier automatically.
          Printful orders arrive as drafts and CJ orders as unpaid, unless you turned on automatic confirmation —
          confirm and pay them in your supplier account. Tracking is added to the order when the supplier ships.
        </p>
        <v-table density="comfortable">
          <thead>
            <tr><th>Order</th><th>Supplier</th><th>Supplier order</th><th>Status</th><th>Tracking</th><th>Date</th></tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td>#{{ o.magentoOrder }}</td>
              <td>{{ providerLabel(o.provider) }}</td>
              <td>{{ o.supplierOrderId || '—' }}</td>
              <td><v-chip size="small" :color="statusColor(o.status)" :title="o.lastError || undefined">{{ o.status.replace('_', ' ') }}</v-chip></td>
              <td>
                <a v-if="o.trackingUrl" :href="o.trackingUrl" target="_blank" rel="noopener noreferrer">{{ o.trackingNumber }}</a>
                <span v-else>{{ o.trackingNumber || '—' }}</span>
              </td>
              <td class="text-caption">{{ new Date(o.dateCreated).toLocaleString() }}</td>
            </tr>
            <tr v-if="!orders.length"><td colspan="6" class="text-medium-emphasis">No supplier orders yet.</td></tr>
          </tbody>
        </v-table>
      </v-window-item>

      <!-- Connections -->
      <v-window-item value="connections">
        <v-list lines="two">
          <v-list-item v-for="c in connections" :key="c.id" :title="c.label" :subtitle="c.lastError || `Connected ${new Date(c.dateCreated).toLocaleDateString()}`">
            <template #prepend>
              <v-avatar :color="c.status === 'active' ? 'success' : 'error'"><v-icon color="white">fas fa-truck-fast</v-icon></v-avatar>
            </template>
            <template #append>
              <v-switch v-if="c.provider === 'printful'" :model-value="c.autoConfirmOrders" label="Confirm orders automatically" density="compact" hide-details class="mr-4"
                @update:model-value="(v) => setAutoConfirm(c, Boolean(v))" />
              <v-btn variant="text" color="error" @click="disconnect(c)">Disconnect</v-btn>
            </template>
          </v-list-item>
          <v-list-item v-if="!connections.length" title="No suppliers connected" />
        </v-list>
      </v-window-item>
    </v-window>

    <!-- Connect dialog -->
    <v-dialog v-model="connectOpen" max-width="520">
      <v-card title="Connect a supplier">
        <v-card-text>
          <v-select v-model="connectForm.provider" :items="providerOptions" label="Supplier" variant="outlined" density="comfortable" />
          <template v-if="connectForm.provider === 'printful'">
            <v-text-field v-model="connectForm.token" type="password" label="Printful private token" variant="outlined" density="comfortable" autocomplete="off"
              hint="Printful → Developer Portal → create a store-level token with the sync products and orders scopes." persistent-hint />
            <v-text-field v-model="connectForm.storeId" label="Store id (only for account-level tokens)" variant="outlined" density="comfortable" class="mt-4" />
          </template>
          <v-text-field v-else v-model="connectForm.apiKey" type="password" label="CJ API key" variant="outlined" density="comfortable" autocomplete="off"
            hint="My CJ → Authorization → API → generate an API key." persistent-hint />
          <p class="text-caption text-medium-emphasis mt-4">Your key is stored encrypted and is only used by our servers to talk to the supplier.</p>
          <v-alert v-if="connectError" type="error" variant="tonal" class="mt-2">{{ connectError }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="connectOpen = false">Cancel</v-btn>
          <v-btn color="primary" :loading="connecting" @click="connect">Connect</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import type { CatalogItem, ForwardedOrder, ImportedProduct, MarkupRule, ProviderId, SupplierConnection } from '../types'

const config = useRuntimeConfig().public.meeoviDropshipping as { apiBase: string, providers: ProviderId[] }
const api = config.apiBase
const LABELS: Record<ProviderId, string> = { printful: 'Printful', cj: 'CJdropshipping' }
const providerLabel = (id: ProviderId) => LABELS[id] ?? id
const providerOptions = config.providers.map((value) => ({ title: LABELS[value] ?? value, value }))

const tab = ref('import')
const pageError = ref('')
const connections = ref<SupplierConnection[]>([])
const products = ref<ImportedProduct[]>([])
const orders = ref<ForwardedOrder[]>([])

const message = (error: any) => error?.data?.statusMessage || error?.statusMessage || error?.message || 'Something went wrong'

async function refresh() {
  try {
    const [c, p, o] = await Promise.all([
      $fetch<SupplierConnection[]>(`${api}/connections`),
      $fetch<ImportedProduct[]>(`${api}/products`),
      $fetch<ForwardedOrder[]>(`${api}/orders`),
    ])
    connections.value = c
    products.value = p
    orders.value = o
    if (!connectionId.value && c[0]) connectionId.value = c[0].id
  } catch (error) {
    pageError.value = message(error)
  }
}

// Catalogue
const connectionId = ref<string | null>(null)
const currentProvider = computed(() => connections.value.find((c) => c.id === connectionId.value)?.provider)
const search = ref('')
const catalog = ref<CatalogItem[]>([])
const page = ref(1)
const hasMore = ref(false)
const catalogLoading = ref(false)
const selected = ref<string[]>([])
const markup = reactive<MarkupRule>({ type: 'percent', value: 40, charmPricing: true })

async function loadCatalog(target = 1) {
  if (!connectionId.value) return
  catalogLoading.value = true
  pageError.value = ''
  try {
    const result = await $fetch<{ items: CatalogItem[], hasMore: boolean }>(`${api}/catalog`, {
      query: { connection: connectionId.value, page: target, q: search.value || undefined },
    })
    catalog.value = result.items
    hasMore.value = result.hasMore
    page.value = target
  } catch (error) {
    pageError.value = message(error)
  } finally {
    catalogLoading.value = false
  }
}
watch(connectionId, () => {
  selected.value = []
  loadCatalog(1)
})

function toggle(id: string) {
  selected.value = selected.value.includes(id) ? selected.value.filter((s) => s !== id) : [...selected.value, id]
}

// Import
const importing = ref(false)
const importSummary = ref<{ text: string, details: string[], errors: boolean } | null>(null)
async function importSelected() {
  importing.value = true
  importSummary.value = null
  try {
    const { results } = await $fetch<{ results: { created: number, updated: number, skipped: string[], errors: string[] }[] }>(`${api}/import`, {
      method: 'POST',
      body: { connection: connectionId.value, productIds: selected.value, markup },
    })
    const created = results.reduce((n, r) => n + r.created, 0)
    const updated = results.reduce((n, r) => n + r.updated, 0)
    const details = results.flatMap((r) => [...r.errors, ...r.skipped])
    importSummary.value = {
      text: `${created} variant${created === 1 ? '' : 's'} added, ${updated} updated.`,
      details: details.slice(0, 20),
      errors: results.some((r) => r.errors.length),
    }
    selected.value = []
    await refresh()
  } catch (error) {
    importSummary.value = { text: message(error), details: [], errors: true }
  } finally {
    importing.value = false
  }
}

// Connections
const connectOpen = ref(false)
const connecting = ref(false)
const connectError = ref('')
const connectForm = reactive({ provider: config.providers[0] ?? 'printful', token: '', storeId: '', apiKey: '' })

async function connect() {
  connecting.value = true
  connectError.value = ''
  try {
    const created = await $fetch<SupplierConnection>(`${api}/connections`, { method: 'POST', body: { ...connectForm } })
    Object.assign(connectForm, { token: '', storeId: '', apiKey: '' })
    connectOpen.value = false
    await refresh()
    connectionId.value = created.id
    tab.value = 'import'
  } catch (error) {
    connectError.value = message(error)
  } finally {
    connecting.value = false
  }
}

async function setAutoConfirm(connection: SupplierConnection, value: boolean) {
  if (value && !window.confirm('Orders will be confirmed at Printful automatically and charged to your Printful account. Continue?')) return
  try {
    const updated = await $fetch<SupplierConnection>(`${api}/connections/${connection.id}`, { method: 'PATCH', body: { autoConfirmOrders: value } })
    Object.assign(connection, updated)
  } catch (error) {
    pageError.value = message(error)
  }
}

async function disconnect(connection: SupplierConnection) {
  if (!window.confirm(`Disconnect ${connection.label}? Imported products stay in your shop but stop syncing stock.`)) return
  try {
    await $fetch(`${api}/connections/${connection.id}`, { method: 'DELETE' })
    if (connectionId.value === connection.id) connectionId.value = null
    await refresh()
  } catch (error) {
    pageError.value = message(error)
  }
}

const statusColor = (status: string) =>
  ({ active: 'success', shipped: 'success', forwarded: 'info', awaiting_payment: 'warning', out_of_stock: 'warning', error: 'error' } as Record<string, string>)[status] ?? undefined

onMounted(refresh)
</script>
