<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>Gaming Settings</v-toolbar-title>
        </v-toolbar>

        <v-divider></v-divider>

        <v-sheet>
            <v-row>
                <v-col cols="4">
                    <v-card href="/lists/list/your-games">
                        <v-card-title>Your Games</v-card-title>
                        <v-card-text>
                            Manage games you own or rent in one place.
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card href="/lists/list/your-games-scores">
                        <v-card-title>Your Scores</v-card-title>
                        <v-card-text>
                            View your scores and scores of those you follow or follow you.
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