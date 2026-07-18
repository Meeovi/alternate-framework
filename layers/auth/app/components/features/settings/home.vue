<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>Your Account</v-toolbar-title>
        </v-toolbar>

        <v-divider></v-divider>

        <v-sheet>
            <v-row>
                <v-col cols="4">
                    <v-card href="/settings/family">
                        <v-card-title>Your Meeovi Family</v-card-title>
                        <v-card-text>
                            Manage profiles, sharing, and permissions in one place.
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card href="/connect/messages">
                        <v-card-title>Your Messages</v-card-title>
                        <v-card-text>
                            View or respond to messages from Meeovi, Sellers, and Buyers
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card href="/space/meeovi-help">
                        <v-card-title>Meeovi Help</v-card-title>
                        <v-card-text>
                            Browse self service options, help articles or contact us.
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card href="/lists/">
                        <v-card-title>Your Lists</v-card-title>
                        <v-card-text>
                            View, modify, and share your lists, or create new ones.
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card href="/settings/business-account">
                        <v-card-title>Your Business Account</v-card-title>
                        <v-card-text>
                            Sign up to save with business-exclusive pricing, schedule fast deliveries during business-hours, and more.
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card href="/product/subscription/meeovi-elite">
                        <v-card-title>Elite</v-card-title>
                        <v-card-text>
                            Manage your membership, view benefits, and payment settings.
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