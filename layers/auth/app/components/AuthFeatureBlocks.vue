<template>
  <section class="space-y-6">
    <AuthProfileEditor
      v-if="showProfile"
      :enabled="showProfile"
      :show-unsupported-state="showUnsupportedState" />

    <Organization
      v-if="showOrganization"
      :enabled="showOrganization"
      :show-unsupported-state="showUnsupportedState" />

    <Social
      v-if="showSocial"
      :enabled="showSocial"
      :show-unsupported-state="showUnsupportedState"
      :providers="socialProviders"
      :callback-u-r-l="callbackURL" />

    <Sso
      v-if="showSso"
      :enabled="showSso"
      :show-unsupported-state="showUnsupportedState"
      :providers="ssoProviders"
      :callback-u-r-l="callbackURL" />

    <TwoFactor
      v-if="showTwoFactor"
      :enabled="showTwoFactor"
      :show-unsupported-state="showUnsupportedState"
      :redirect-to="twoFactorRedirectTo" />

    <TwoFaCard
      v-if="showTwoFactorCard"
      :enabled="showTwoFactorCard"
      :show-unsupported-state="showUnsupportedState"
      :show-sign-out="showSignOutOnTwoFactorCard" />

    <SsoProvisioningManager
      v-if="showSsoProvisioning"
      :enabled="showSsoProvisioning"
      :show-unsupported-state="showUnsupportedState"
      :providers="ssoProviders"
      :callback-u-r-l="callbackURL" />

    <LogoutButton
      v-if="showLogout"
      :enabled="showLogout"
      :redirect-to="logoutRedirectTo" />
  </section>
</template>

<script setup lang="ts">
import AuthProfileEditor from './AuthProfileEditor.vue'
import LogoutButton from './blocks/logoutButton.vue'
import TwoFaCard from './blocks/2faCard.vue'
import Organization from './organization.vue'
import Social from './social.vue'
import SsoProvisioningManager from './SSOProvisioningManager.vue'
import Sso from './sso.vue'
import TwoFactor from './twoFactor.vue'

withDefaults(defineProps<{
  showProfile?: boolean
  showOrganization?: boolean
  showSocial?: boolean
  showSso?: boolean
  showTwoFactor?: boolean
  showTwoFactorCard?: boolean
  showSsoProvisioning?: boolean
  showLogout?: boolean
  showUnsupportedState?: boolean
  showSignOutOnTwoFactorCard?: boolean
  socialProviders?: string[]
  ssoProviders?: string[]
  callbackURL?: string
  twoFactorRedirectTo?: string
  logoutRedirectTo?: string
}>(), {
  showProfile: true,
  showOrganization: true,
  showSocial: true,
  showSso: false,
  showTwoFactor: false,
  showTwoFactorCard: true,
  showSsoProvisioning: false,
  showLogout: true,
  showUnsupportedState: false,
  showSignOutOnTwoFactorCard: true,
  socialProviders: () => ['google', 'github'],
  ssoProviders: () => ['google'],
  callbackURL: '/',
  twoFactorRedirectTo: '/dashboard',
  logoutRedirectTo: '/login',
})
</script>
