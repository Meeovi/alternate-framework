<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Payouts</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <v-card variant="outlined" class="mb-4">
        <v-card-text>
          <v-row align="center" dense>
            <v-col cols="12" sm="4">
              <v-text-field v-model.number="amount" type="number" min="0" step="0.01" label="Amount" density="compact" hide-details />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select v-model="method" :items="methodOptions" item-title="label" item-value="id" label="Method" density="compact" hide-details />
            </v-col>
            <v-col cols="12" sm="4">
              <v-btn :loading="requesting" :disabled="!amount || amount <= 0" color="primary" @click="submit">
                Request Payout
              </v-btn>
            </v-col>
          </v-row>
          <v-alert v-if="requestError" type="error" variant="tonal" density="compact" class="mt-3">
            Couldn't submit the payout request.
          </v-alert>
        </v-card-text>
      </v-card>

      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerPayouts } from '~/composables/dashboard/useSellerPayouts'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Payouts',
  meta: [
    {
      name: 'description',
      content: 'Request a payout and track the status of past requests.'
    }
  ]
})

const { columns, rows, pending, error, methodOptions, requesting, requestError, requestPayout } = useSellerPayouts()

const amount = ref(null)
const method = ref('paypal')

async function submit() {
  if (!amount.value || amount.value <= 0) return
  await requestPayout(amount.value, method.value)
  amount.value = null
}
</script>
