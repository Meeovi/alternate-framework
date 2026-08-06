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
                            <DynamicForm collection="payments" />
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
    import { DynamicForm } from '@mframework/meeovi-forms'

    const show = ref(false)
</script>