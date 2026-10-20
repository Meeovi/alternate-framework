<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="contentPage">
    <v-toolbar color="primary" class="mb-4">
      <v-toolbar-title>Licenses</v-toolbar-title>
      <v-toolbar-items>
        <v-btn variant="text" prepend-icon="fas fa-rotate" text="Re-issue for a payment" @click="reissueOpen = true" />
      </v-toolbar-items>
    </v-toolbar>

    <div class="contentSection">
      <div class="d-flex flex-wrap ga-2 align-center mb-4">
        <v-text-field v-model="search" label="Email, username, product, key or payment" density="compact" hide-details clearable
          prepend-inner-icon="fas fa-magnifying-glass" class="licenses__search" @update:model-value="page = 1" />
        <v-select v-model="status" :items="STATUSES" label="Status" density="compact" hide-details clearable class="licenses__status"
          @update:model-value="page = 1" />
        <v-spacer />
        <span class="text-body-2 text-medium-emphasis">{{ data.total }} license{{ data.total === 1 ? '' : 's' }}</span>
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error.statusMessage || 'Licenses couldn\'t be loaded.'" />

      <v-table density="comfortable" hover>
        <thead>
          <tr>
            <th>Owner</th>
            <th>Product</th>
            <th>Offer</th>
            <th>Status</th>
            <th class="text-right">Installed</th>
            <th>Purchase</th>
            <th>Issued</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!pending && !data.licenses.length">
            <td colspan="7" class="text-medium-emphasis">No licenses match.</td>
          </tr>
          <tr v-for="l in data.licenses" :key="l.id" class="licenses__row" @click="open(l.id)">
            <td>{{ l.username || l.email || l.userId }}</td>
            <td>{{ l.productId }}</td>
            <td>{{ l.offer }}</td>
            <td><v-chip size="small" variant="tonal" :color="STATUS_COLORS[l.status]" :text="l.status" /></td>
            <td class="text-right">{{ l.installations }}</td>
            <td class="licenses__mono">{{ l.purchaseId }}</td>
            <td>{{ new Date(l.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </v-table>
      <div v-if="pages > 1" class="d-flex justify-center mt-4">
        <v-pagination v-model="page" :length="pages" density="comfortable" />
      </div>
    </div>

    <!-- One license -->
    <v-dialog v-model="detailOpen" max-width="720" scrollable>
      <v-card v-if="detail">
        <v-card-title>{{ detail.offer?.title || detail.license.productId }}</v-card-title>
        <v-card-subtitle>
          {{ detail.owner ? (detail.owner.username || detail.owner.email) : detail.license.userId }} ·
          {{ detail.terms?.title || detail.license.versionId }}
        </v-card-subtitle>
        <v-card-text>
          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip size="small" variant="tonal" :color="STATUS_COLORS[detail.license.status]" :text="detail.license.status" />
            <v-chip size="small" variant="tonal" :text="`${detail.downloads} download${detail.downloads === 1 ? '' : 's'}`" />
            <v-chip v-if="detail.license.expiresAt" size="small" variant="tonal"
              :text="`Expires ${new Date(detail.license.expiresAt).toLocaleDateString()}`" />
          </div>
          <dl class="licenses__facts mb-4">
            <dt>License key</dt><dd class="licenses__mono">{{ detail.license.licenseKey }}</dd>
            <dt>Product</dt><dd>{{ detail.license.productId }}</dd>
            <dt>Purchase</dt><dd class="licenses__mono">{{ detail.license.purchaseId }}</dd>
            <dt>Issued</dt><dd>{{ new Date(detail.license.createdAt).toLocaleString() }}</dd>
            <dt v-if="detail.owner">Owner</dt><dd v-if="detail.owner">{{ detail.owner.name }} &lt;{{ detail.owner.email }}&gt;</dd>
          </dl>

          <div class="text-subtitle-2 mb-2">Installations</div>
          <v-table density="compact" class="mb-4">
            <tbody>
              <tr v-if="!detail.installations.length"><td class="text-medium-emphasis">Never installed.</td></tr>
              <tr v-for="i in detail.installations" :key="i.id">
                <td>{{ i.targetType }} {{ i.targetId }}</td>
                <td>{{ new Date(i.installedAt).toLocaleString() }}</td>
                <td><v-chip size="x-small" variant="tonal" :color="i.active ? 'success' : 'grey'" :text="i.active ? 'active' : 'removed'" /></td>
              </tr>
            </tbody>
          </v-table>

          <template v-if="detail.license.status !== 'revoked'">
            <v-textarea v-model="revokeReason" label="Reason for revoking (kept on the license)" rows="2" auto-grow hide-details="auto"
              :error-messages="revokeError ? [revokeError] : []" />
          </template>
          <v-alert v-else type="info" variant="tonal" density="compact"
            :text="`Revoked${detail.license.metadata?.revokedReason ? `: ${detail.license.metadata.revokedReason}` : ''}. Revoking is final.`" />
        </v-card-text>
        <v-card-actions>
          <v-btn v-if="detail.license.status !== 'revoked'" color="error" variant="tonal" text="Revoke" :loading="revoking"
            :disabled="!revokeReason.trim()" @click="revoke" />
          <v-spacer />
          <v-btn text="Close" @click="detailOpen = false" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Re-issue -->
    <v-dialog v-model="reissueOpen" max-width="520">
      <v-card>
        <v-card-title>Re-issue licenses for a payment</v-card-title>
        <v-card-text>
          <p class="text-body-2 mb-4">
            Runs the license step of a paid checkout again — for when the payment webhook failed, or a paid product
            didn't have licensing yet. Licenses that exist are kept as they are; missing ones are issued.
          </p>
          <v-text-field v-model="reissuePayment" label="Stripe payment (pi_…)" :error-messages="reissueError ? [reissueError] : []" />
          <div v-if="reissued" class="text-body-2">
            {{ reissued.length ? reissued.map((l) => `${l.productId}: ${l.status}`).join(', ') : 'That payment bought nothing that comes with a license.' }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text="Close" @click="reissueOpen = false" />
          <v-btn color="primary" variant="flat" text="Re-issue" :loading="reissuing" :disabled="!/^pi_\w+$/.test(reissuePayment.trim())"
            @click="reissue" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="toast.show" :color="toast.color" timeout="4000">{{ toast.text }}</v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

// Every license (layers/commerce licensing), for admins:
// server/api/workspace/licenses. Revoking uses the licensing API itself.
definePageMeta({ middleware: 'auth', roles: ['admin'] })
useHead({ title: 'Licenses' })

const STATUSES = ['active', 'suspended', 'expired', 'revoked']
const STATUS_COLORS: Record<string, string> = { active: 'success', suspended: 'warning', expired: 'grey', revoked: 'error' }

type Row = { id: string, status: string, productId: string, offer: string | null, purchaseId: string, createdAt: string,
  userId: string, email: string | null, username: string | null, installations: number }

const search = ref('')
const searchDebounced = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { searchDebounced.value = value ?? '' }, 300)
})
const status = ref<string | null>(null)
const page = ref(1)
const { data, pending, error, refresh } = await useFetch<{ licenses: Row[], total: number, pageSize: number }>('/api/workspace/licenses', {
  query: { search: searchDebounced, status, page },
  default: () => ({ licenses: [], total: 0, pageSize: 50 }),
})
const pages = computed(() => Math.ceil((data.value.total || 0) / (data.value.pageSize || 50)))

// ---- one license ---------------------------------------------------------
const detailOpen = ref(false)
const detail = ref<any>(null)
const revokeReason = ref('')
const revokeError = ref('')
const revoking = ref(false)
const toast = reactive({ show: false, text: '', color: 'success' })

async function open(id: string) {
  revokeReason.value = ''
  revokeError.value = ''
  detail.value = await $fetch(`/api/workspace/licenses/${encodeURIComponent(id)}`).catch(() => null)
  detailOpen.value = !!detail.value
}

async function revoke() {
  revoking.value = true
  revokeError.value = ''
  try {
    await $fetch(`/api/licenses/${encodeURIComponent(detail.value.license.id)}/revoke`, {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: { reason: revokeReason.value.trim() },
    })
    Object.assign(toast, { show: true, color: 'success', text: 'License revoked.' })
    await Promise.all([open(detail.value.license.id), refresh()])
  } catch (e: any) {
    revokeError.value = e?.data?.error?.message || e?.data?.statusMessage || 'It couldn\'t be revoked.'
  } finally {
    revoking.value = false
  }
}

// ---- re-issue ------------------------------------------------------------
const reissueOpen = ref(false)
const reissuePayment = ref('')
const reissueError = ref('')
const reissuing = ref(false)
const reissued = ref<{ productId: string, status: string }[] | null>(null)

async function reissue() {
  reissuing.value = true
  reissueError.value = ''
  reissued.value = null
  try {
    const result = await $fetch<{ licenses: { productId: string, status: string }[] }>('/api/workspace/licenses/reissue', {
      method: 'POST', body: { paymentIntentId: reissuePayment.value.trim() },
    })
    reissued.value = result.licenses
    await refresh()
  } catch (e: any) {
    reissueError.value = e?.data?.statusMessage || 'That payment couldn\'t be processed.'
  } finally {
    reissuing.value = false
  }
}
</script>

<style scoped>
.licenses__search {
  flex: 1 1 280px;
  max-width: 420px;
}

.licenses__status {
  max-width: 170px;
}

.licenses__row {
  cursor: pointer;
}

.licenses__mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85em;
  word-break: break-all;
}

.licenses__facts {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 16px;
}

.licenses__facts dt {
  font-weight: 600;
}
</style>
