<script setup lang="ts">
import type { SocialProfile, Member, FriendRequest, FriendSuggestion } from '../../composables/contacts/types'
import { computed, toRef } from 'vue'

type MemberLike = SocialProfile | Member | FriendRequest | FriendSuggestion

const props = defineProps<{ member: MemberLike }>()
const member = toRef(props, 'member')

const directusUrl = useDirectusUrl?.()
const hasAsset = (file: any) => Boolean(getAssetUrl(file))

function resolveProfile(m: MemberLike): any {
  if ('profile' in m && m.profile) return m.profile
  if ('requester' in m && m.requester) return m.requester
  return m
}

const displayName = computed(() => {
  const profile = resolveProfile(member.value)
  if (profile?.name) return profile.name
  if ((profile as any)?.first_name && (profile as any)?.last_name) {
    return `${(profile as any).first_name} ${(profile as any).last_name}`
  }
  return (profile as any)?.first_name || (profile as any)?.last_name || 'Unknown User'
})

const avatarUrl = computed(() => {
  const profile = resolveProfile(member.value)
  return (profile as any)?.avatar || (profile as any)?.avatar_url || ''
})

const userLink = computed(() => {
  const profile = resolveProfile(member.value)
  return `/user/${(profile as any)?.id || (member.value as any)?.id}`
})
</script>

<template>
  <v-card class="friend-card mx-auto" max-width="400">
    <v-card-text>
      <div class="d-flex align-center gap-3">
        <NuxtImg
          v-if="hasAsset(avatarUrl)"
          provider="ipx"
          class="friend-avatar"
          :src="getAssetUrl(avatarUrl)"
          :alt="displayName"
        />
        <v-avatar
          v-else
          class="friend-avatar"
          size="48"
          color="grey-lighten-2"
        >
          <v-icon icon="fas fa-user" />
        </v-avatar>

        <div class="flex-grow-1">
          <div class="friend-name">{{ displayName }}</div>
          <div v-if="'role' in member && member.role" class="friend-role text-caption">
            {{ member.role }}
          </div>
        </div>

        <v-btn
          color="primary"
          variant="text"
          size="small"
          :to="userLink"
        >
          View
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.friend-card {
  margin: 8px;
  border-radius: 12px;
}
.friend-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
.friend-name {
  font-weight: 500;
  font-size: 0.95rem;
}
.friend-role {
  color: #666;
  margin-top: 2px;
}
.gap-3 {
  gap: 12px;
}
</style>
