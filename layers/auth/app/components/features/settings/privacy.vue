<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>Privacy and Security Settings</v-toolbar-title>
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
                    <v-card href="/security/find-my-m-device">
                        <v-card-title>Find my M device</v-card-title>
                        <v-card-text>
                            Track your device if you think you've lost it
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-list lines="two">
                    <v-list-subheader inset>Permissions</v-list-subheader>

                    <v-list-item v-for="permission in permissions" :key="permission.title"
                        :subtitle="permission.subtitle" :title="permission.title">
                        <template v-slot:prepend>
                            <v-avatar color="grey-lighten-1">
                                <v-icon color="white">mdi-permission</v-icon>
                            </v-avatar>
                        </template>

                        <template v-slot:append>
                            <v-switch label="Enable" true-icon="mdi-check" false-icon="mdi-close"></v-switch>
                        </template>
                    </v-list-item>

                    <v-divider inset></v-divider>

                    <v-list-subheader inset>Security</v-list-subheader>

                    <v-list-item v-for="secure in security" :key="secure.title" :subtitle="secure.subtitle"
                        :title="secure.title">
                        <template v-slot:prepend>
                            <v-avatar :color="secure.color">
                                <v-icon color="white">{{ secure.icon }}</v-icon>
                            </v-avatar>
                        </template>

                        <template v-slot:append>
                            <v-switch label="Enable" true-icon="mdi-check" false-icon="mdi-close"></v-switch>
                        </template>
                    </v-list-item>
                </v-list>
            </v-row>
        </v-sheet>
    </div>
</template>

<script setup>
    import {
        ref
    } from '#imports'

    const tab = ref(null)

    const security = [{
            color: 'blue',
            icon: 'mdi-clipboard-text',
            subtitle: 'We keep your data secure',
            title: 'Meeovi Security',
        },
        {
            color: 'amber',
            icon: 'mdi-gesture-tap-button',
            subtitle: 'Enable two-factor authentication',
            title: 'Two-Factor Authentication',
        },
    ]

    const permissions = [{
            subtitle: 'Personalized offers, personalized ads, advertising ID',
            title: 'Recommendation & Offers',
        },
        {
            subtitle: 'Diagnostic data, feedback frequency, crash reports',
            title: 'Diagnostics & Feedback',
        },
        {
            subtitle: 'Display your search history, search suggestions',
            title: 'Search Suggestions',
        },
        {
            subtitle: 'Display your location history, ask for location',
            title: 'Location',
        },
        {
            subtitle: 'Allow camera access',
            title: 'Camera',
        },
    ]
</script>