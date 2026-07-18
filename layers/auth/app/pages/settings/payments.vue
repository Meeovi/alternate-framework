<template>
    <div>
        <v-toolbar flat>
            <v-toolbar-title>Your Payments</v-toolbar-title>
        </v-toolbar>

        <div v-for="payment in payments" :key="payment.id">
            <v-card class="mx-auto" max-width="344">
                <v-img height="200px" src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg" cover></v-img>

                <v-card-title>
                    {{ payment.method }}
                </v-card-title>

                <v-card-subtitle>
                    Card ending in {{ payment.last4 }}
                </v-card-subtitle>

                <v-card-actions>
                    <p>{{ payment.name }}</p>

                    <v-spacer></v-spacer>

                    <v-btn :icon="show ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="show = !show"></v-btn>
                </v-card-actions>

                <v-expand-transition>
                    <div v-show="show">
                        <v-divider></v-divider>

                        <v-card-text>
                            <v-card class="b-1">
                                <template>
                                    <div v-if="formError" class="error">{{ formError }}</div>
                                    <div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
                                    <v-form @submit.prevent="submitForm">
                                        <DataFormElement v-for="field in paymentsFields" :key="field.field"
                                            :field="field" v-model="form[field.field]" />
                                        <v-btn type="submit">Save</v-btn>
                                    </v-form>
                                </template>
                            </v-card>
                        </v-card-text>
                    </div>
                </v-expand-transition>
            </v-card>
        </div>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'

    const show = ref(false)
    const {
        $directus,
        $readFieldsByCollection
    } = useNuxtApp()

    const {
        data: payments,
        error
    } = await useAsyncData('payments', async () => {
        return $directus.request($readFieldsByCollection('payments'))
    })

    const {
        data: createPaymentsFields,
        error: createPaymentsError
    } = await useAsyncData('createPayments', async () => {
        return $directus.request($readFieldsByCollection('payments'))
    })

    // guard against undefined/null data.value and empty arrays
    if (createPaymentsError.value || createPaymentsFields.value == null || (createPaymentsFields.value?.length ?? 0) ===
        0) {
        console.error(createPaymentsError)
        throw createError({
            statusCode: 404,
            statusMessage: 'Payment fields not found'
        })
    }

    const paymentsFields = createPaymentsFields

    // use composable for form handling (validation, submit, provide context)
    const {
        form,
        formError,
        formSuccess,
        submitForm
    } = useDataForm('payments', paymentsFields, {
        clearOnSuccess: true,
        closeDialogRef: dialog
    })
</script>