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
                    <v-list-subheader inset>Your data</v-list-subheader>
                    <v-list-item title="Download your data"
                        subtitle="Your account, sign-in history and everything you've posted, as a JSON file">
                        <template v-slot:prepend>
                            <v-avatar color="blue"><v-icon color="white">fas fa-download</v-icon></v-avatar>
                        </template>
                        <template v-slot:append>
                            <v-btn variant="tonal" href="/api/account/export" download>Download</v-btn>
                        </template>
                    </v-list-item>
                    <v-list-item title="Two-factor authentication" subtitle="Ask for a code as well as your password"
                        to="/workspace/settings/two-factor">
                        <template v-slot:prepend>
                            <v-avatar color="amber"><v-icon color="white">fas fa-hand-pointer</v-icon></v-avatar>
                        </template>
                    </v-list-item>
                    <v-list-item title="Cookie settings" subtitle="Choose whether we use analytics and advertising cookies"
                        @click="openCookieSettings">
                        <template v-slot:prepend>
                            <v-avatar color="teal"><v-icon color="white">fas fa-cookie-bite</v-icon></v-avatar>
                        </template>
                    </v-list-item>
                    <v-list-item title="Privacy policy" subtitle="What we collect, why, and your rights"
                        to="/privacy-policies">
                        <template v-slot:prepend>
                            <v-avatar color="grey-lighten-1"><v-icon color="white">fas fa-shield-halved</v-icon></v-avatar>
                        </template>
                    </v-list-item>
                    <v-divider inset></v-divider>
                    <v-list-subheader inset>Delete account</v-list-subheader>
                    <v-list-item title="Delete your account"
                        subtitle="Permanently removes your account, sign-ins and profile. This can't be undone.">
                        <template v-slot:prepend>
                            <v-avatar color="error"><v-icon color="white">fas fa-trash</v-icon></v-avatar>
                        </template>
                        <template v-slot:append>
                            <v-btn color="error" variant="tonal" @click="deleteDialog = true">Delete</v-btn>
                        </template>
                    </v-list-item>
                </v-list>
                </v-col>
            </v-row>
        </v-sheet>

        <v-dialog v-model="deleteDialog" max-width="480">
            <v-card title="Delete your account?">
                <v-card-text>
                    <p class="mb-4">This permanently deletes your account and signs you out everywhere. Download your data first if you want a copy.</p>
                    <v-text-field v-model="deletePassword" type="password" label="Your password" hint="Signed up with Google, Apple etc.? Leave blank — you'll need to have signed in within the last day." persistent-hint
                        autocomplete="current-password" variant="outlined" :error-messages="deleteError || undefined" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="deleteDialog = false">Cancel</v-btn>
                    <v-btn color="error" :loading="deleting" @click="deleteAccount">Delete account</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
    import {
        ref
    } from '#imports'
    import { authClient } from '../../../../../auth/lib/auth-client'
    import { useCookieConsent } from '#shared/app/composables/useCookieConsent'

    const { openSettings: openCookieSettings } = useCookieConsent()

    const tab = ref(null)
    const {
        $directus,
        $readItems
    } = useNuxtApp()
    
    const deleteDialog = ref(false)
    const deletePassword = ref('')
    const deleteError = ref('')
    const deleting = ref(false)
    async function deleteAccount() {
        deleting.value = true
        deleteError.value = ''
        // better-auth POST /delete-user: checks the password, runs
        // deleteUser.beforeDelete (open subscriptions block it), then
        // removes the user — sessions, logins, profile cascade.
        const { error } = await authClient.deleteUser({ ...(deletePassword.value ? { password: deletePassword.value } : {}), callbackURL: '/' })
        deleting.value = false
        if (error) {
            deleteError.value = error.message || "Couldn't delete your account"
            return
        }
        deletePassword.value = ''
        await navigateTo('/', { external: true })
    }
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

  definePageMeta({
    layout: 'workspace'
  })
</script>