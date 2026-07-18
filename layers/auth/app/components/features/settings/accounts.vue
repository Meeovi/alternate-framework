<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>Account Settings</v-toolbar-title>
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

                <v-expansion-panel title="Single Sign On">
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col>
                                <SSOProvisioningManager />
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

<script setup>
    import { ref } from "vue"
    import TwoFactorManager from '../plugins/twoFactor.vue/index.js'
    import AddressCard from '../../related/addressCard.vue'
    import SSOProvisioningManager from '../../sso.vue'
    import MagicLink from '../plugins/magicLink.vue/index.js'
    import PassKey from '../plugins/PasskeyManager.vue/index.js'
    import OneTapManager from '../plugins/oneTap.vue/index.js'
    import MultiSessionManager from '../../plugins/sessions.vue'
    import OneTimeTokenManager from '../../plugins/ott.vue'

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

</script>