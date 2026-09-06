<template>
    <div class="contentPage">
        <v-toolbar style="background-color: gray;">
            <v-toolbar-title>{{ accountPrivacy?.name }}</v-toolbar-title>
        </v-toolbar>

        <v-divider></v-divider>

        <v-sheet>
            <v-row>
                <v-col cols="6" v-for="home in accountPrivacy?.repeaterTextBox" :key="home">
                    <v-card :href="`${home?.url}`">
                        <v-card-title>{{ home?.name }}</v-card-title>
                        <v-card-text>
                            {{ home?.description }}
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12">
                <v-list lines="two">
                    <v-list-subheader inset>Permissions</v-list-subheader>

                    <v-list-item v-for="permission in permissions" :key="permission.title"
                        :subtitle="permission.subtitle" :title="permission.title">
                        <template v-slot:prepend>
                            <v-avatar color="grey-lighten-1">
                                <v-icon color="white">fas fa-shield-halved</v-icon>
                            </v-avatar>
                        </template>

                        <template v-slot:append>
                            <v-switch label="Enable" true-icon="fas fa-check" false-icon="fas fa-xmark"></v-switch>
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
                            <v-switch label="Enable" true-icon="fas fa-check" false-icon="fas fa-xmark"></v-switch>
                        </template>
                    </v-list-item>
                </v-list>
                </v-col>
            </v-row>
        </v-sheet>
    </div>
</template>

<script setup>
    import {
        ref
    } from '#imports'

    const tab = ref(null)
    const {
        $directus,
        $readItems
    } = useNuxtApp()
    
    const security = [{
            color: 'blue',
            icon: 'fas fa-clipboard',
            subtitle: 'We keep your data secure',
            title: 'Meeovi Security',
        },
        {
            color: 'amber',
            icon: 'fas fa-hand-pointer',
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
    
    const {
      data: accountPrivacy
    } = await useAsyncData('accountPrivacy', async () => {
      const result = await $directus.request($readItems('pages', {
        filter: {
          slug: {
            _eq: 'privacy-and-security-settings'
          }
        },
        fields: '*',
        limit: 1
      }))
      return Array.isArray(result) ? result[0] : null
    })

  useHead({
    title: () => accountPrivacy.value?.name || 'Page',
  })
</script>