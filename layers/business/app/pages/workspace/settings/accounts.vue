<template>
    <div class="contentPage">
        <v-toolbar color="primary">
            <v-toolbar-title>{{ myAccount?.name }}</v-toolbar-title>
        </v-toolbar>

        <v-card>
            <v-expansion-panels>
                <v-expansion-panel title="Addresses">
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col>
                                <addressCard v-for="(address, index) in addresses" :key="index" :address="address" />
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>

                <v-expansion-panel title="Account Details">
                    <v-expansion-panel-text>
                        <v-form>
                            <v-text-field label="Email" v-model="email" />
                            <v-text-field label="Username" v-model="username" />
                            <v-text-field label="Current Password" v-model="currentPassword" type="password" />
                            <v-text-field label="New Password" v-model="newPassword" type="password" />
                            <v-text-field label="Confirm Password" v-model="confirmPassword" type="password" />
                            <v-text-field label="Phone Number" v-model="phoneNumber" type="number" />
                            <v-btn color="primary" text="Save Changes" />
                        </v-form>
                    </v-expansion-panel-text>
                </v-expansion-panel>

                <v-expansion-panel title="Magic Link">
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col>
                                <MagicLink />
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>

                <v-expansion-panel title="Passkey">
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col>
                                <PassKey />
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>

                <!-- Fediverse accounts are connected here, after signing in (moved off the login page 2026-11-04). -->
                <v-expansion-panel title="Connect fediverse accounts (Bluesky / AT Protocol)">
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col>
                                <p class="text-body-2 mb-4">
                                    Connect your Bluesky or other AT Protocol account to post, follow and see your feed from Meeovi.
                                </p>
                                <!-- OAuth: approve Meeovi on your own Bluesky server (any PDS). -->
                                <BlueskyOAuth link callbackURL="/workspace/settings/accounts" class="mb-4" />
                                <BlueskyCrosspost class="mb-4" />
                                <v-expansion-panels variant="accordion" flat>
                                    <v-expansion-panel title="Use an app password instead">
                                        <v-expansion-panel-text>
                                            <AtprotoLink mode="link" />
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                </v-expansion-panels>
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>

                <v-expansion-panel v-if="SsoSignIn" title="Single Sign On">
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col>
                                <component :is="SsoSignIn" />
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>

                <v-expansion-panel title="Two Factor Authentication">
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col>
                                <TwoFactorManager />
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>

                <v-expansion-panel title="One Tap Authentication">
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col>
                                <OneTapManager />
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>  
                
                <v-expansion-panel title="Multi-Session Authentication">
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col>
                                <MultiSessionManager />
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>  

                <v-expansion-panel title="One Time Token">
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col>
                                <OneTimeTokenManager />
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>  
            </v-expansion-panels>

            <v-divider></v-divider>
        </v-card>
    </div>
</template>

<script setup lang="ts">
    import { ref, resolveComponent } from "vue"
    import TwoFactorManager from '../../../../../auth/app/components/features/plugins/twoFactor.vue'
    import AddressCard from '../../../../../auth/app/components/related/addressCard.vue'
    import MagicLink from '../../../../../auth/app/components/features/plugins/magicLink.vue'
    import PassKey from '../../../../../auth/app/components/features/plugins/PasskeyManager.vue'
    import OneTapManager from '../../../../../auth/app/components/features/plugins/oneTap.vue'
    import MultiSessionManager from '../../../../../auth/app/components/features/plugins/sessions.vue'
    import OneTimeTokenManager from '../../../../../auth/app/components/features/plugins/ott.vue'
    import AtprotoLink from '../../../../../auth/app/components/features/plugins/atproto.vue'
    import BlueskyOAuth from '../../../../../auth/app/components/features/plugins/BlueskyOAuth.vue'
    import BlueskyCrosspost from '../../../../../auth/app/components/features/plugins/BlueskyCrosspost.vue'

    // <AuthSsoSignIn> comes from @mframework/auth-sso, when the app registers it.
    const SsoSignIn = (useAppConfig() as { mframeworkAuth?: { sso?: boolean } }).mframeworkAuth?.sso
        ? resolveComponent('AuthSsoSignIn')
        : null

    const addresses = ref([])

    const email = ref('')
    const username = ref('')
    const phoneNumber = ref('')
    const currentPassword = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const errorMessage = ref('')
    const status = ref<'idle' | 'saving' | 'success' | 'error'>('idle')

    const tab = ref(null)
    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const {
      data: myAccount
    } = await useAsyncData('myAccount', async () => {
      const result = await $directus.request($readItems('pages', {
        filter: {
          slug: {
            _eq: 'your-account'
          }
        },
        fields: '*',
        limit: 1
      }))
      return Array.isArray(result) ? result[0] : null
    })

  useHead({
    title: () => myAccount.value?.name || 'Page',
  })

  definePageMeta({
    layout: 'workspace'
  })
</script>