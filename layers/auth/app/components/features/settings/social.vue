<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>Manage Your Social</v-toolbar-title>
        </v-toolbar>

        <v-divider></v-divider>

        <v-sheet>
            <v-row>
                <v-col cols="4">
                    <v-card href="/connect/feeds">
                        <v-card-title>Your Notes</v-card-title>
                        <v-card-text>
                            Manage your activity feed.
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card href="/connect/spaces#myspaces">
                        <v-card-title>Your Spaces</v-card-title>
                        <v-card-text>
                            Manage your social spaces and connections
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card href="/connect/hashtags#myhashtags">
                        <v-card-title>Your Hashtags</v-card-title>
                        <v-card-text>
                            Manage your saved hashtags and trending topics
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card href="/connect/vibez#myvibez">
                        <v-card-title>Digital Content and Devices</v-card-title>
                        <v-card-text>
                            Manage your Vibez and Watch History.
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card href="/connect/donations#mydonations">
                        <v-card-title>Donations</v-card-title>
                        <v-card-text>
                            Manage your donation preferences and history.
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