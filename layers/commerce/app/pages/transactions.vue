<template>
    <div>
        <v-row>
            <v-col cols="12" v-for="transaction in transactions" :key="transaction.id">
                <v-card>
                    <v-toolbar flat>
                        <v-toolbar-title>{{ transaction?.name }}</v-toolbar-title>

                        <v-toolbar-items>
                            {{ transaction?.amount }}
                        </v-toolbar-items>
                    </v-toolbar>
                    <v-card-title>{{ transaction?.name }}</v-card-title>
                    <v-card-text>
                        {{ transaction?.date }}
                        <br>
                        {{ transaction?.status }}
                        <br>
                        <NuxtLink :to="`/order/${transaction?.order?.order_id?.id}`"></NuxtLink>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
const { $directus, $readItem } = useNuxtApp()

const { data: transactions } = await useAsyncData('transactions', () => {
  return $directus.request($readList('transactions'))
})
</script>