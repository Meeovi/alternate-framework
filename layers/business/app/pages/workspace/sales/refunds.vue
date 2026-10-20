<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="contentPage">
    <v-toolbar color="primary" class="mb-4">
      <v-toolbar-title>Refunds</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <v-alert v-if="storesLoaded && !stores.length" type="info" variant="tonal" class="mb-4"
        text="No store is connected that can refund orders here. Refund in the store's own admin, or connect its integration." />

      <template v-else>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Refunding sends the money back through Stripe, then records a credit memo in the store so its books and the
          seller's sale match. A full refund of a payment also revokes the licenses it bought.
        </p>

        <div class="d-flex flex-wrap ga-2 align-center mb-4">
          <v-select v-if="stores.length > 1" v-model="store" :items="stores" item-title="label" item-value="id" label="Store"
            density="compact" hide-details class="refunds__store" />
          <v-text-field v-model="lookup" label="Order number or Stripe payment (pi_…)" density="compact" hide-details clearable
            prepend-inner-icon="fas fa-magnifying-glass" class="refunds__lookup" @keyup.enter="find()" />
          <v-btn color="primary" variant="flat" text="Find" :loading="loading" :disabled="!lookup?.trim()" @click="find()" />
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" closable @click:close="error = ''" />

        <!-- One order -->
        <v-card v-if="detail" elevation="0" border class="mb-6">
          <v-card-item>
            <v-card-title>Order {{ detail.order.number }}</v-card-title>
            <v-card-subtitle>
              {{ [customerName, detail.order.customer_email, placed].filter(Boolean).join(' · ') }}
            </v-card-subtitle>
            <template #append>
              <v-btn icon variant="text" aria-label="Close" @click="detail = null">
                <v-icon icon="fas fa-xmark" size="16" />
              </v-btn>
            </template>
          </v-card-item>

          <v-card-text>
            <div class="d-flex flex-wrap ga-2 mb-4">
              <v-chip size="small" variant="tonal" :text="`Total ${money(detail.order.grand_total / 100)}`" />
              <v-chip size="small" variant="tonal" :color="detail.order.total_refunded ? 'warning' : undefined"
                :text="`Refunded in store ${money(detail.order.total_refunded / 100)}`" />
              <v-chip v-if="detail.payment" size="small" variant="tonal" color="info"
                :text="`Stripe ${detail.payment.id}: ${money(detail.payment.amount / 100)} paid, ${money(detail.payment.refunded / 100)} refunded`" />
              <v-chip v-for="l in detail.licenses" :key="l.id" size="small" variant="tonal"
                :color="l.status === 'active' ? 'success' : 'grey'" prepend-icon="fas fa-key" :text="`${l.productId} · ${l.status}`" />
            </div>

            <v-alert v-if="!detail.payment" type="info" variant="tonal" density="comfortable" class="mb-4"
              text="This order wasn't paid through the app's Stripe checkout, so it can't be refunded here. Refund it in the store's own admin." />
            <v-alert v-else-if="!detail.order.refundable.length" type="success" variant="tonal" density="comfortable" class="mb-4"
              text="Everything on this order has been refunded." />

            <template v-else>
              <v-table density="comfortable" class="mb-4">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Refundable</th>
                    <th class="refunds__qty">Refund</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="line in detail.order.refundable" :key="line.key">
                    <td>{{ line.name }}</td>
                    <td class="text-right">{{ money(line.unit_amount) }}</td>
                    <td class="text-right">{{ line.qty }}</td>
                    <td>
                      <v-text-field v-model.number="qty[line.key]" type="number" min="0" :max="line.qty" density="compact" hide-details
                        :aria-label="`Quantity of ${line.name} to refund`" />
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <v-textarea v-model="reason" label="Reason (kept on the credit memo and in the audit log)" rows="2" auto-grow class="mb-2" />
              <v-btn color="error" variant="flat" prepend-icon="fas fa-rotate-left" :disabled="refundCents <= 0"
                :text="`Refund ${money(refundCents / 100)}`" @click="confirm = true" />
            </template>
          </v-card-text>
        </v-card>

        <!-- Recent orders -->
        <div class="text-subtitle-1 mb-2">Recent orders</div>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th class="text-right">Total</th>
              <th class="text-right">Refunded</th>
              <th>Placed</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-if="recentError">
              <td colspan="6" class="text-medium-emphasis">{{ recentError }}</td>
            </tr>
            <tr v-for="row in recent" :key="String(row.id)">
              <td>{{ row.number }}</td>
              <td>{{ row.customer_name || row.customer_email }}</td>
              <td class="text-right">{{ money(Number(row.grand_total), String(row.currency || '')) }}</td>
              <td class="text-right">{{ Number(row.total_refunded) ? money(Number(row.total_refunded), String(row.currency || '')) : '' }}</td>
              <td>{{ row.created_at ? new Date(String(row.created_at)).toLocaleDateString() : '' }}</td>
              <td class="text-right">
                <v-btn size="small" variant="text" text="Open" @click="find({ id: String(row.id) })" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </div>

    <v-dialog v-model="confirm" max-width="460">
      <v-card>
        <v-card-title>Refund {{ money(refundCents / 100) }}?</v-card-title>
        <v-card-text>
          The money goes back to the customer's card through Stripe, and a credit memo is recorded on order
          {{ detail?.order.number }}. This can't be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text="Cancel" @click="confirm = false" />
          <v-btn color="error" variant="flat" text="Refund" :loading="refunding" @click="refund" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="toast.show" :color="toast.color" timeout="6000">{{ toast.text }}</v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

// Admins refund store orders paid through the app's Stripe checkout:
// server/api/workspace/refunds (layers/commerce).
definePageMeta({ middleware: 'auth', roles: ['admin'] })
useHead({ title: 'Refunds' })

type Line = { key: string, name: string, qty: number, unit_amount: number }
type Detail = {
  store: string
  order: { id: string, number: string, date_created: string, order_currency_code: string, grand_total: number, total_refunded: number,
    customer_firstname: string | null, customer_lastname: string | null, customer_email: string | null, refundable: Line[] }
  payment: { id: string, amount: number, refunded: number, currency: string } | null
  licenses: { id: string, productId: string, status: string }[]
}

const { data: storesData } = await useFetch<{ stores: { id: string, label: string }[] }>('/api/workspace/refunds/stores', {
  default: () => ({ stores: [] }),
})
const stores = computed(() => storesData.value?.stores ?? [])
const storesLoaded = computed(() => !!storesData.value)
const store = ref('magento')
watch(stores, (list) => { if (list.length && !list.some((s) => s.id === store.value)) store.value = list[0]!.id }, { immediate: true })

const { data: recentData, error: recentFetchError, refresh: refreshRecent } = await useFetch<{ orders: Record<string, unknown>[] }>(
  '/api/workspace/refunds/recent', { query: { store }, default: () => ({ orders: [] }), watch: [store] })
const recent = computed(() => recentData.value?.orders ?? [])
const recentError = computed(() => (recentFetchError.value ? (recentFetchError.value.statusMessage || 'Orders couldn\'t be loaded.') : ''))

const lookup = ref('')
const loading = ref(false)
const error = ref('')
const detail = ref<Detail | null>(null)
const qty = reactive<Record<string, number>>({})
const reason = ref('')
// One key per refund attempt: retrying the same attempt never refunds twice.
let attemptKey = ''

const currency = computed(() => detail.value?.order.order_currency_code || 'USD')
function money(amount: number, code = currency.value) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: code || 'USD' }).format(amount || 0)
  } catch {
    return (amount || 0).toFixed(2)
  }
}
const customerName = computed(() => [detail.value?.order.customer_firstname, detail.value?.order.customer_lastname].filter(Boolean).join(' '))
const placed = computed(() => (detail.value?.order.date_created ? `placed ${new Date(detail.value.order.date_created).toLocaleDateString()}` : ''))

const chosen = computed(() => (detail.value?.order.refundable ?? [])
  .map((line) => ({ line, qty: Math.max(0, Math.min(line.qty, Math.floor(Number(qty[line.key]) || 0))) }))
  .filter((c) => c.qty > 0))
const refundCents = computed(() => chosen.value.reduce((sum, c) => sum + Math.round(c.line.unit_amount * c.qty * 100), 0))

async function find(by?: { id: string }) {
  error.value = ''
  const text = lookup.value?.trim() ?? ''
  const query = by ?? (text.startsWith('pi_') ? { reference: text } : { number: text })
  loading.value = true
  try {
    detail.value = await $fetch<Detail>('/api/workspace/refunds/order', { query: { store: store.value, ...query } })
    for (const key of Object.keys(qty)) delete qty[key]
    for (const line of detail.value.order.refundable) qty[line.key] = line.qty
    reason.value = ''
    attemptKey = crypto.randomUUID()
  } catch (e: any) {
    detail.value = null
    error.value = e?.data?.statusMessage || e?.statusMessage || 'That order couldn\'t be loaded.'
  } finally {
    loading.value = false
  }
}

const confirm = ref(false)
const refunding = ref(false)
const toast = reactive({ show: false, text: '', color: 'success' })

async function refund() {
  if (!detail.value) return
  refunding.value = true
  error.value = ''
  try {
    const all = chosen.value.length === detail.value.order.refundable.length && chosen.value.every((c) => c.qty === c.line.qty)
    const result = await $fetch<{ refundId: string, amount: number, creditMemoId: string | null, creditMemoError?: string }>('/api/workspace/refunds', {
      method: 'POST',
      headers: { 'Idempotency-Key': attemptKey },
      body: {
        store: store.value,
        orderId: detail.value.order.id,
        ...(all ? {} : { items: chosen.value.map((c) => ({ key: c.line.key, qty: c.qty })) }),
        reason: reason.value,
      },
    })
    confirm.value = false
    if (result.creditMemoError) {
      // Same key on purpose: retrying records the credit memo without refunding again.
      error.value = result.creditMemoError
    } else {
      Object.assign(toast, { show: true, color: 'success', text: `Refunded ${money(result.amount / 100)} (Stripe ${result.refundId}, credit memo ${result.creditMemoId}).` })
      const id = detail.value.order.id
      await Promise.all([find({ id }), refreshRecent()])
    }
  } catch (e: any) {
    confirm.value = false
    error.value = e?.data?.statusMessage || e?.statusMessage || 'The refund failed.'
  } finally {
    refunding.value = false
  }
}
</script>

<style scoped>
.refunds__store {
  max-width: 180px;
}

.refunds__lookup {
  flex: 1 1 280px;
  max-width: 420px;
}

.refunds__qty {
  width: 110px;
}
</style>
