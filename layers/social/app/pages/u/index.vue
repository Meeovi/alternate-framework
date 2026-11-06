<template>
  <v-container fluid class="pa-0 profile-page bg-background">
    <v-container v-if="notFound" class="py-16 text-center">
      <v-icon icon="fas fa-user-slash" size="48" class="mb-4 text-medium-emphasis" />
      <h1 class="text-h5 mb-2">Profile not found</h1>
      <p class="text-medium-emphasis mb-6">There's no one here by that name.</p>
      <v-btn color="primary" to="/connect/members">Find people</v-btn>
    </v-container>

    <template v-else>
      <ProfileHeader
        v-model:tab="tab"
        :cover-image="cover"
        :avatar-url="avatar"
        :display-name="name"
        :username="profile?.username || ''"
        :is-owner="isOwner"
        :follow-id="followId"
        :report-did="reportDid"
        :load-error="isOwner ? profileLoadError : ''"
        :is-dark="isDark"
        @toggle-theme="toggleTheme"
        @sign-out="signOut"
        @update:cover="(url) => patchProfile({ cover: url || null })"
        @update:avatar="onAvatarChanged"
      />

      <v-container class="px-4 px-md-8 pb-8">
        <div v-if="!profile && pending" class="d-flex justify-center py-10">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- A Bluesky account moderators have labelled (warn / blur); hidden ones don't load at all. -->
        <v-alert v-if="profile?.moderation" type="warning" variant="tonal" density="compact" class="mb-4"
          icon="fas fa-triangle-exclamation" :text="`Moderators have labelled this account${profile.moderation.reasons?.length ? `: ${profile.moderation.reasons.join(', ')}` : ''}. Its notes may be covered.`" />

        <v-tabs-window v-else v-model="tab">
          <!-- Discussions: notes, and for the owner their composer and content -->
          <v-tabs-window-item value="discussions">
            <v-row>
              <v-col cols="12" md="4">
                <!-- Trust score: average rating of everything this creator made -->
                <v-card v-if="isMember" class="mb-4 pa-4" elevation="0" border>
                  <MeeoviCreatorRating :user-id="String(profile.id)" />
                </v-card>
                <ProfileIntroCard v-if="isOwner" :username="profile?.username || ''" :member-id="profile?.id" :role="userRole" />
                <ProfileSectionCard v-else title="Intro">
                  <p v-if="profile?.description" class="profile-text mb-2">{{ excerpt(profile.description) }}</p>
                  <p v-if="profile?.memberSince" class="text-medium-emphasis mb-2">Member since {{ formatDate(profile.memberSince) }}</p>
                  <p v-if="profile?.federated" class="text-medium-emphasis mb-2">
                    <v-icon :icon="networkIcon" size="small" /> @{{ profile.federated.handle }} on {{ profile.federated.label }}
                  </p>
                  <v-btn v-if="profile?.links?.length" variant="tonal" size="small" prepend-icon="fas fa-link" @click="tab = 'connect'">
                    Connect with {{ firstName }}
                  </v-btn>
                </ProfileSectionCard>
                <ProfileManageCard v-if="isOwner" :is-seller="isSeller" />
              </v-col>

              <v-col cols="12" md="8">
                <template v-if="isOwner">
                  <ProfilePostComposer />

                  <!-- Your notes with drafts and edit actions; when that list is empty or
                       can't be read, the published ones everyone sees. -->
                  <ProfilePostsCard
                    v-if="socialPosts?.length || !profile?.notes?.length"
                    mt
                    status
                    show-actions
                    title="My Notes"
                    :posts="socialPosts"
                    :available="socialPostsAvailable"
                    :message="socialPostsMessage"
                  />
                  <v-row v-else class="mt-2">
                    <v-col v-for="note in profile.notes" :key="note.id" cols="12" sm="6">
                      <RelatedPost :post="toPost(note)" />
                    </v-col>
                  </v-row>

                  <v-row class="mt-1">
                    <v-col cols="12" md="6">
                      <ProfileSpacesCard status :spaces="spaces" :available="spacesAvailable" :message="spacesMessage" :limit="8" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <ProfileHashtagsCard :hashtags="hashtags" :available="hashtagsAvailable" :message="hashtagsMessage" />
                    </v-col>
                  </v-row>

                  <v-row class="mt-1">
                    <v-col cols="12" md="6">
                      <ProfileEventsCard :events="events" :available="eventsAvailable" :message="eventsMessage" />
                    </v-col>
                    <v-col v-if="isSeller" cols="12" md="6">
                      <ProfileShopCard :shops="shops" :available="shopsAvailable" :message="shopsMessage" />
                    </v-col>
                  </v-row>
                </template>

                <template v-else>
                  <v-row v-if="profile?.notes?.length">
                    <v-col v-for="note in profile.notes" :key="note.id" cols="12" sm="6">
                      <RelatedPost :post="toPost(note)" />
                    </v-col>
                  </v-row>
                  <p v-else class="text-center text-medium-emphasis py-8">No notes yet.</p>
                </template>
              </v-col>
            </v-row>
          </v-tabs-window-item>

          <v-tabs-window-item value="about">
            <v-card class="mx-auto" max-width="760" border elevation="0">
              <v-card-item>
                <template #prepend>
                  <v-avatar :image="avatar" size="72" />
                </template>
                <v-card-title class="text-h5">{{ name }}</v-card-title>
                <v-card-subtitle v-if="profile?.profession || profile?.company">
                  {{ [profile?.profession, profile?.company].filter(Boolean).join(' · ') }}
                </v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <p v-if="profile?.description" class="profile-text">{{ profile.description }}</p>
                <p v-else class="text-medium-emphasis">
                  {{ isOwner ? 'Add a description to your profile to tell people about yourself.' : 'No description yet.' }}
                </p>
                <v-list density="comfortable" class="mt-2 bg-transparent">
                  <v-list-item v-if="profile?.memberSince" prepend-icon="fas fa-calendar" title="Member since" :subtitle="formatDate(profile.memberSince)" />
                  <v-list-item v-if="profile?.federated" :prepend-icon="networkIcon" :title="`@${profile.federated.handle} on ${profile.federated.label}`"
                    :subtitle="federatedCounts" />
                  <template v-if="isOwner">
                    <v-list-item v-if="profile?.username" prepend-icon="fas fa-at" title="Username" :subtitle="`@${profile.username}`" />
                    <v-list-item prepend-icon="fas fa-shield" title="Role" :subtitle="userRole" />
                  </template>
                </v-list>
              </v-card-text>
              <v-card-actions v-if="isOwner">
                <v-btn color="primary" variant="tonal" prepend-icon="fas fa-user-pen" to="/u/settings">Edit profile</v-btn>
              </v-card-actions>
            </v-card>
          </v-tabs-window-item>

          <v-tabs-window-item value="vibez">
            <v-row v-if="profile?.vibez?.length">
              <v-col v-for="vibe in profile.vibez" :key="vibe.id" cols="12" sm="6" md="3">
                <RelatedShort :short="vibe" />
              </v-col>
            </v-row>
            <div v-else class="text-center text-medium-emphasis py-8">
              <p class="mb-4">No vibez yet.</p>
              <v-btn v-if="isOwner" color="primary" prepend-icon="fas fa-video" to="/workspace/content/manage-vibez">Share a vibe</v-btn>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item value="connect">
            <ProfileConnectLinks
              :links="profile?.links || []"
              :name="name"
              :username="profile?.username"
              :avatar="avatar"
              :bio="profile?.description ? excerpt(profile.description) : ''"
              :is-owner="isOwner"
              :share-url="shareUrl"
              @saved="onLinksSaved"
            />
          </v-tabs-window-item>
        </v-tabs-window>

        <!-- Someone from Bluesky or the Fediverse: their profile stays on
             Meeovi, and the original is credited, whichever tab is open. -->
        <BlocksSourceAttribution v-if="profile?.source" class="pa-4" kind="profile"
          :url="profile.source.url" :network="profile.source.network" />
      </v-container>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { navigateTo, useAsyncData, useNuxtApp, useHead, useRequestFetch, useRequestURL, useRoute, useRouter } from '#imports'
import { getAssetURL } from '#shared/app/utils/get-asset-url'

import ProfileHeader from '../../components/features/profile/ProfileHeader.vue'
import ProfileSectionCard from '../../components/features/profile/ProfileSectionCard.vue'
import ProfileIntroCard from '../../components/features/profile/ProfileIntroCard.vue'
import ProfileManageCard from '../../components/features/profile/ProfileManageCard.vue'
import ProfilePostComposer from '../../components/features/profile/ProfilePostComposer.vue'
import ProfilePostsCard from '../../components/features/profile/ProfilePostsCard.vue'
import ProfileSpacesCard from '../../components/features/profile/ProfileSpacesCard.vue'
import ProfileHashtagsCard from '../../components/features/profile/ProfileHashtagsCard.vue'
import ProfileEventsCard from '../../components/features/profile/ProfileEventsCard.vue'
import ProfileShopCard from '../../components/features/profile/ProfileShopCard.vue'
import ProfileConnectLinks from '../../components/features/profile/ProfileConnectLinks.vue'
import RelatedPost from '../../components/related/post.vue'
import RelatedShort from '../../components/related/short.vue'

import { useProfileIdentity } from '../../composables/profile/useProfileIdentity'
import { useProfileSocial } from '../../composables/profile/useProfileSocial'
import { useProfileActions } from '../../composables/profile/useProfileActions'

/**
 * Every profile, one page:
 *  - /u                 your own profile (sign-in needed);
 *  - /u/<id|username|profile slug>   a member's;
 *  - /u/<handle or DID> a Bluesky account, /u/<user@instance> a Fediverse one.
 * Tabs: Discussions, About, Vibez, Connect with Me (?tab= in the address,
 * so /u/<name>?tab=connect can be shared like a Linktree page). The owner
 * also gets their composer, drafts and content cards, and edits their links.
 * Data: GET /api/profiles/:slug (auth layer) for everyone; the owner's own
 * panels come from composables/profile/*.
 */
definePageMeta({
  layout: 'nolive',
  path: '/u/:slug(.*)*',
  middleware: [
    async (to) => {
      const slug = ([] as unknown[]).concat(to.params.slug ?? []).join('/')
      if (slug) return
      // /u is your own profile: sign in first (same check as the auth
      // middleware). An inline middleware loses the Nuxt instance after an
      // await, so navigate through the app it started with.
      const nuxtApp = useNuxtApp()
      const session: any = await useRequestFetch()('/api/auth/get-session').catch(() => null)
      if (!session?.user) return nuxtApp.runWithContext(() => navigateTo({ path: '/login', query: { redirect: to.fullPath } }))
    },
  ],
})

const route = useRoute()
const router = useRouter()
const requestFetch = useRequestFetch()

const slug = computed(() => ([] as unknown[]).concat(route.params.slug ?? []).map(String).join('/'))

const {
  user,
  profileLoadError,
  displayName,
  userRole,
  avatarUrl,
  isSeller,
  setSessionUser,
  loadCustomerFallback,
  bindWatchers,
} = useProfileIdentity()

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

// NOT awaited on purpose (here and below): a top-level `await` stops the
// rest of this setup from running on the client during hydration. Nuxt
// still waits for both before the server render.
const { data: sessionData } = useAsyncData('u-profile-session', async () => {
  const session: any = await requestFetch('/api/auth/get-session').catch(() => null)
  setSessionUser(session?.user ?? null)
  return session
})
watchEffect(() => setSessionUser((sessionData.value as any)?.user ?? null))
bindWatchers()

const { data: profile, error, pending } = useAsyncData<any>(
  () => `u-profile:${slug.value || 'me'}`,
  async () => {
    let key = slug.value
    if (!key) {
      const session: any = await requestFetch('/api/auth/get-session').catch(() => null)
      key = session?.user?.id || ''
    }
    return key ? requestFetch(`/api/profiles/${encodeURIComponent(key)}`) : null
  },
  { watch: [slug] },
)

const notFound = computed(() => (error.value as any)?.statusCode === 404)
const sessionUserId = computed(() => (sessionData.value as any)?.user?.id || user.value?.id || null)
const isOwner = computed(() => !!sessionUserId.value && sessionUserId.value === profile.value?.id)
// A Meeovi member (not someone only on Bluesky or the Fediverse).
const isMember = computed(() => !!profile.value?.memberSince)

const name = computed(() => profile.value?.name || (isOwner.value ? displayName.value : '') || 'Profile')
const firstName = computed(() => String(name.value).split(/\s+/)[0])
const avatar = computed(() => getAssetURL(profile.value?.image)
  || (isOwner.value ? avatarUrl.value : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.value)}`))
// Saved with PUT /api/profiles/me/cover; none yet = the theme colour.
const cover = computed(() => profile.value?.cover || '')

// Members by id; Bluesky accounts by DID (FollowButton's atproto: ids).
const followId = computed(() => {
  const p = profile.value
  if (!p?.id || isOwner.value) return ''
  if (isMember.value) return String(p.id)
  return p.federated?.network === 'atproto' && String(p.id).startsWith('did:') ? `atproto:${p.id}` : ''
})

// Someone from Bluesky (not a member): they can be reported to our Ozone.
const reportDid = computed(() => {
  const p = profile.value
  return !isOwner.value && !isMember.value && p?.federated?.network === 'atproto' && String(p.id || '').startsWith('did:') ? String(p.id) : ''
})

const networkIcon = computed(() => profile.value?.federated?.network === 'activitypub' ? 'fab fa-mastodon' : 'fab fa-bluesky')
const federatedCounts = computed(() => {
  const f = profile.value?.federated
  return f?.followers === undefined ? '' : `${f.followers.toLocaleString()} followers · ${f.following.toLocaleString()} following · ${f.notes.toLocaleString()} notes`
})

// The tab is in the address (?tab=connect) so it can be linked to.
const TABS = ['discussions', 'about', 'vibez', 'connect']
const tab = computed({
  get: () => (TABS.includes(String(route.query.tab)) ? String(route.query.tab) : 'discussions'),
  set: (value: string) => {
    router.replace({ query: { ...route.query, tab: value === 'discussions' ? undefined : value } }).catch(() => {})
  },
})

const origin = useRequestURL().origin
const shareUrl = computed(() => {
  const key = profile.value?.username || profile.value?.id || slug.value
  return key ? `${origin}/u/${encodeURIComponent(key)}?tab=connect` : ''
})

// related/post.vue expects a full post (author, date_created, image_url…).
// Bluesky/Fediverse notes (network set) already come in that shape.
const toPost = (note: any) => note?.network ? note : ({
  ...note,
  description: note.excerpt,
  date_created: note.date,
  image_url: note.image,
  // postEditMenu shows "edit" to the author only.
  creator_id: profile.value?.id,
  author: { name: profile.value?.name, avatar: profile.value?.image },
})

// useAsyncData data is a shallow ref: replace it, don't edit it in place.
const patchProfile = (changes: Record<string, unknown>) => {
  if (profile.value) profile.value = { ...profile.value, ...changes }
}
const onLinksSaved = (links: unknown[]) => patchProfile({ links })
const onAvatarChanged = (url: string) => {
  patchProfile({ image: url })
  if (user.value) user.value = { ...user.value, image: url }
}

const excerpt = (text: string) => (text.length > 220 ? `${text.slice(0, 217).trimEnd()}…` : text)
const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

// The owner's own panels (drafts, spaces, hashtags, events, shop):
// client-only, once we know it's their profile.
useAsyncData(
  'u-profile-panels',
  async () => {
    if (!isOwner.value || !user.value?.id) return null
    if (!user.value.email) await loadCustomerFallback()
    await loadSocialFeatures()
    return { at: Date.now() }
  },
  { server: false, lazy: true, watch: [isOwner, () => user.value?.id] },
)

useHead({
  title: computed(() => (notFound.value ? 'Profile not found' : name.value)),
  meta: [{ name: 'description', content: computed(() => profile.value?.description ? excerpt(profile.value.description) : `${name.value} on Meeovi`) }],
})
</script>

<style scoped>
.profile-page {
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
}

.profile-text {
  white-space: pre-line;
}
</style>
