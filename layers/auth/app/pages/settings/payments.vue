<template>
    <div>
        <v-toolbar flat>
            <v-toolbar-title>Your Payments</v-toolbar-title>
        </v-toolbar>

        <div v-if="pending" class="pa-4 d-flex justify-center">
            <v-progress-circular indeterminate />
        </div>

        <v-alert v-else-if="error" type="error" variant="tonal" class="ma-4">
            Couldn't load your saved payment methods. Please try again later.
        </v-alert>

        <v-alert v-else-if="!methods.length" type="info" variant="tonal" class="ma-4">
            You don't have any saved payment methods yet. They'll appear here after
            your first checkout.
        </v-alert>

        <div v-else class="pa-4 d-flex flex-wrap ga-4">
            <v-card v-for="method in methods" :key="method.id" width="344">
                <v-card-item>
                    <template #prepend>
                        <v-icon :icon="brandIcon(method.brand)" size="32" />
                    </template>
                    <v-card-title class="text-capitalize">
                        {{ method.brand }} •••• {{ method.last4 }}
                    </v-card-title>
                    <v-card-subtitle>
                        Expires {{ String(method.expMonth).padStart(2, '0') }}/{{ method.expYear }}
                    </v-card-subtitle>
                </v-card-item>

                <v-card-text v-if="method.name" class="pt-0 text-medium-emphasis">
                    {{ method.name }}
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SavedPaymentMethod {
    id: string
    brand: string
    last4: string
    expMonth: number
    expYear: number
    name: string | null
}

const { data, pending, error } = await useFetch<{ methods: SavedPaymentMethod[] }>(
    '/api/payment/methods',
)

const methods = computed(() => data.value?.methods ?? [])

const brandIcons: Record<string, string> = {
    visa: 'fab fa-cc-visa',
    mastercard: 'fab fa-cc-mastercard',
    amex: 'fab fa-cc-amex',
    discover: 'fab fa-cc-discover',
    jcb: 'fab fa-cc-jcb',
    diners: 'fab fa-cc-diners-club',
}

function brandIcon(brand: string): string {
    return brandIcons[brand?.toLowerCase()] ?? 'fas fa-credit-card'
}
</script>
