<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>Manage Your Shopping</v-toolbar-title>
        </v-toolbar>

        <v-divider></v-divider>

        <v-sheet>
            <v-row>
                <v-col cols="4">
                    <v-card href="/orders">
                        <v-card-title>Your Orders</v-card-title>
                        <v-card-text>
                            Track, return, cancel an order, download invoice or buy again
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4" href="/product/subscriptions">
                    <v-card>
                        <v-card-title>Subscriptions</v-card-title>
                        <v-card-text>
                            Manage your active subscriptions and payment methods
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4" href="/settings/payments">
                    <v-card>
                        <v-card-title>Your Payments</v-card-title>
                        <v-card-text>
                            Manage your saved payment methods and transaction history
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4" href="/settings/digital-content-and-devices">
                    <v-card>
                        <v-card-title>Digital Content and Devices</v-card-title>
                        <v-card-text>
                            Manage your digital content and devices.
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4" href="/settings/business-account">
                    <v-card>
                        <v-card-title>Your Business Account</v-card-title>
                        <v-card-text>
                            Sign up to save with business-exclusive pricing, schedule fast deliveries during business-hours, and more.
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4" href="/settings/shopping-programs-and-rentals">
                    <v-card>
                        <v-card-title>Shopping programs and rentals</v-card-title>
                        <v-card-text>
                            Buy now, pay over time, plus many more benefits, rewards, and great shopping benefits.
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-sheet>
    </div>
</template>

<script setup>
    import { ref } from '#imports'
    
    const tab = ref(null)
</script>