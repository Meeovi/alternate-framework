<template>
    <div>
        <v-row>
            <v-col cols="12" v-for="transaction in transactions" :key="transaction.id">
                <v-card>
                    <v-toolbar flat>
                        <v-toolbar-title>Transaction {{ transaction?.id }}</v-toolbar-title>

                        <v-toolbar-items>
                            {{ transaction?.amount }}
                        </v-toolbar-items>
                    </v-toolbar>
                    <v-card-text>
                        {{ transaction?.date_created ? new Date(transaction.date_created).toLocaleDateString() : '' }}
                        <br>
                        {{ transaction?.status }}
                        <br>
                        <NuxtLink :to="`/order/${transaction?.order}`">View order</NuxtLink>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" v-if="!transactions?.length">
                No transactions yet.
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
import { useAuth } from '#auth/app/composables/useAuth'

const { $directus, $readItems } = useNuxtApp()

const { data: session } = await useAuth().getSession()
const userId = session?.user?.id ?? null

// Explicit field list — transactions.invoices is a broken M2M alias field
// (no relation config behind it in Directus), so fields: ['*'] throws a
// 500. Needs a real schema fix; until then, only request what this page
// renders.
const { data: transactions } = await useAsyncData('transactions', () => {
  if (!userId) return []
  return $directus.request($readItems('transactions', {
    fields: ['id', 'amount', 'date_created', 'status', 'order'],
    filter: {
      order: {
        user_id: { _eq: userId }
      }
    }
  }))
})
</script>
