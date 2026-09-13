<template>
  <v-container fluid class="pa-0 profile-page bg-background">
    <ProfileHeader
      v-model:tab="tab"
      :cover-image="coverImage"
      :avatar-url="avatarUrl"
      :display-name="displayName"
      :email="userEmail"
      :load-error="profileLoadError"
      :is-dark="isDark"
      @toggle-theme="toggleTheme"
      @sign-out="signOut"
    />

    <v-container class="px-4 px-md-8 pb-8">
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="timeline">
          <v-row>
            <v-col cols="12" md="4">
              <ProfileIntroCard :email="userEmail" :member-id="userId" :role="userRole" />
              <ProfileManageCard :is-seller="isSeller" />
            </v-col>

            <v-col cols="12" md="8">
              <ProfilePostComposer />

              <ProfilePostsCard
                mt
                title="Recent Posts"
                :posts="socialPosts"
                :available="socialPostsAvailable"
                :message="socialPostsMessage"
              />

              <v-row class="mt-1">
                <v-col cols="12" md="6">
                  <ProfileSpacesCard
                    :spaces="spaces"
                    :available="spacesAvailable"
                    :message="spacesMessage"
                    :limit="3"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <ProfileHashtagsCard
                    :hashtags="hashtags"
                    :available="hashtagsAvailable"
                    :message="hashtagsMessage"
                  />
                </v-col>
              </v-row>

              <v-row class="mt-1">
                <v-col cols="12" md="6">
                  <ProfileEventsCard
                    :events="events"
                    :available="eventsAvailable"
                    :message="eventsMessage"
                  />
                </v-col>
                <v-col v-if="isSeller" cols="12" md="6">
                  <ProfileShopCard
                    :shops="shops"
                    :available="shopsAvailable"
                    :message="shopsMessage"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-tabs-window-item>

        <v-tabs-window-item value="about">
          <ProfileAboutCard :display-name="displayName" :email="userEmail" :role="userRole" />
        </v-tabs-window-item>

        <v-tabs-window-item value="commerce">
          <v-row>
            <v-col cols="12" md="6">
              <ProfileGiftCardsCard
                :gift-cards="giftCards"
                :available="giftCardsAvailable"
                :message="giftCardsMessage"
              />
            </v-col>
            <v-col cols="12" md="6">
              <ProfileSubscriptionsCard
                :subscriptions="subscriptions"
                :available="subscriptionsAvailable"
                :message="subscriptionsMessage"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>

        <v-tabs-window-item value="social">
          <v-row>
            <v-col cols="12" md="6">
              <ProfilePostsCard
                status
                show-actions
                title="My Posts"
                :posts="socialPosts"
                :available="socialPostsAvailable"
                :message="socialPostsMessage"
              />
            </v-col>
            <v-col cols="12" md="6">
              <ProfileSpacesCard
                status
                :spaces="spaces"
                :available="spacesAvailable"
                :message="spacesMessage"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useAsyncData, useRequestFetch } from '#imports'

import ProfileHeader from '../../components/features/profile/ProfileHeader.vue'
import ProfileIntroCard from '../../components/features/profile/ProfileIntroCard.vue'
import ProfileManageCard from '../../components/features/profile/ProfileManageCard.vue'
import ProfilePostComposer from '../../components/features/profile/ProfilePostComposer.vue'
import ProfilePostsCard from '../../components/features/profile/ProfilePostsCard.vue'
import ProfileSpacesCard from '../../components/features/profile/ProfileSpacesCard.vue'
import ProfileHashtagsCard from '../../components/features/profile/ProfileHashtagsCard.vue'
import ProfileEventsCard from '../../components/features/profile/ProfileEventsCard.vue'
import ProfileShopCard from '../../components/features/profile/ProfileShopCard.vue'
import ProfileAboutCard from '../../components/features/profile/ProfileAboutCard.vue'
import ProfileGiftCardsCard from '../../components/features/profile/ProfileGiftCardsCard.vue'
import ProfileSubscriptionsCard from '../../components/features/profile/ProfileSubscriptionsCard.vue'

import { useProfileIdentity } from '../../composables/profile/useProfileIdentity'
import { useProfileCommerce } from '../../composables/profile/useProfileCommerce'
import { useProfileSocial } from '../../composables/profile/useProfileSocial'
import { useProfileActions } from '../../composables/profile/useProfileActions'

definePageMeta({
  layout: 'nolive',
  middleware: 'auth',
})

const {
  user,
  profileLoadError,
  displayName,
  userEmail,
  userId,
  userRole,
  avatarUrl,
  coverImage,
  isSeller,
  setSessionUser,
  loadCustomerFallback,
  bindWatchers,
} = useProfileIdentity()

const {
  giftCards,
  giftCardsAvailable,
  giftCardsMessage,
  subscriptions,
  subscriptionsAvailable,
  subscriptionsMessage,
  loadCommerceFeatures,
} = useProfileCommerce()

const {
  socialPosts,
  spaces,
  hashtags,
  events,
  shops,
  socialPostsAvailable,
  spacesAvailable,
  hashtagsAvailable,
  eventsAvailable,
  shopsAvailable,
  socialPostsMessage,
  spacesMessage,
  hashtagsMessage,
  eventsMessage,
  shopsMessage,
  loadSocialFeatures,
} = useProfileSocial()

const { isDark, toggleTheme, signOut } = useProfileActions()

// SSR-safe session read: a relative-url request-aware fetch forwards the
// session cookie on SSR, unlike useSession(useFetch) which drops it (see
// layers/auth/app/middleware/auth.ts). The `auth` route middleware above
// is the real access gate; this only feeds the profile UI.
//
// NOT awaited on purpose: a top-level `await` here stops the rest of this
// setup (the panel loader below) from running on the client during
// hydration. Nuxt still awaits the handler before SSR render, and the
// handler seeds `useState` (serialised into the payload), so the markup
// is still rendered with the user resolved — no hydration mismatch.
const { data: sessionData } = useAsyncData('u-profile-session', async () => {
  const session: any = await useRequestFetch()('/api/auth/get-session').catch(() => null)
  setSessionUser(session?.user ?? null)
  return session
})

watchEffect(() => setSessionUser((sessionData.value as any)?.user ?? null))
bindWatchers()

const tab = ref('timeline')

// Commerce + social panels: client-only, re-run whenever the signed-in
// user id changes.
useAsyncData(
  'u-profile-panels',
  async () => {
    if (!user.value?.id) return null
    if (!user.value.email) await loadCustomerFallback()
    await Promise.all([loadCommerceFeatures(), loadSocialFeatures()])
    return { at: Date.now() }
  },
  { server: false, lazy: true, watch: [() => user.value?.id] },
)
</script>

<style scoped>
.profile-page {
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
}
</style>
