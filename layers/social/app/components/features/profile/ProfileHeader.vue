<template>
  <div>
    <v-sheet class="cover-wrap" :class="{ 'cover-wrap--empty': !coverImage }" color="primary" rounded="0">
      <!-- No cover yet: the theme colour instead of a stock photo. -->
      <v-img
        v-if="coverImage"
        :src="coverImage"
        class="cover-image"
        cover
        gradient="to bottom, rgba(0,0,0,.12), rgba(0,0,0,.45)"
      />
      <div v-if="isOwner" class="cover-actions">
        <v-btn
          variant="flat"
          color="surface"
          prepend-icon="fas fa-image"
          :loading="images.busy.value === 'cover'"
          @click="coverPicker?.click()"
        >
          {{ coverImage ? 'Change cover' : 'Add a cover' }}
        </v-btn>
        <v-btn
          v-if="coverImage"
          variant="flat"
          color="surface"
          icon="fas fa-trash"
          size="small"
          aria-label="Remove cover"
          :disabled="!!images.busy.value"
          @click="removeCover"
        />
        <!-- Phones: "Update Profile" is right below. -->
        <v-btn class="d-none d-md-flex" variant="flat" color="surface" prepend-icon="fas fa-gear" to="/u/settings">
          Edit Profile
        </v-btn>
      </div>
    </v-sheet>

    <v-container class="profile-head px-4 px-md-8">
      <v-row align="end" class="ma-0">
        <div class="avatar-wrap">
          <v-avatar size="168" class="profile-avatar" border="lg">
            <v-img :src="avatarUrl" :alt="displayName" cover />
          </v-avatar>
          <v-btn
            v-if="isOwner"
            class="avatar-change"
            icon="fas fa-camera"
            color="primary"
            size="small"
            aria-label="Change your avatar"
            title="Change your avatar"
            :loading="images.busy.value === 'avatar'"
            @click="avatarPicker?.click()"
          />
        </div>

        <div class="profile-meta ml-4 mb-3">
          <h1 class="text-h4 font-weight-bold mb-1">{{ displayName }}</h1>
          <div v-if="username" class="text-medium-emphasis">@{{ username }}</div>
          <div v-if="loadError" class="text-caption text-error mt-1">{{ loadError }}</div>
          <div v-if="images.error.value" class="text-caption text-error mt-1">{{ images.error.value }}</div>
        </div>

        <v-spacer />

        <div v-if="!isOwner" class="mb-3 d-flex ga-2 align-center">
          <!-- Someone else's profile: follow them (Bluesky accounts by DID). -->
          <FollowButton v-if="followId" entity-type="user" :id="followId" />
          <!-- A Bluesky account: report it to Meeovi's moderators (Ozone) -->
          <ReportToModerators v-if="reportDid" network="atproto" :subject="{ kind: 'account', id: reportDid }" />
        </div>
        <div v-else class="mb-3 d-flex flex-wrap ga-2">
          <v-btn variant="tonal" prepend-icon="fas fa-circle-half-stroke" @click="$emit('toggle-theme')">
            {{ isDark ? 'Dark' : 'Light' }} Mode
          </v-btn>
          <v-btn color="primary" prepend-icon="fas fa-user-pen" to="/u/settings">
            Update Profile
          </v-btn>
          <v-btn variant="outlined" prepend-icon="fas fa-right-from-bracket" @click="$emit('sign-out')">
            Logout
          </v-btn>
        </div>
      </v-row>

      <input ref="coverPicker" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/avif" hidden @change="onCover">
      <input ref="avatarPicker" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/avif" hidden @change="onAvatar">

      <v-tabs
        :model-value="tab"
        class="mt-4"
        color="primary"
        grow
        show-arrows
        @update:model-value="$emit('update:tab', $event)"
      >
        <v-tab v-for="t in tabs" :key="t.value" :value="t.value">{{ t.label }}</v-tab>
      </v-tabs>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FollowButton from '../../blocks/FollowButton.vue'
import ReportToModerators from '../../blocks/ReportToModerators.vue'
import { useProfileImages } from '../../../composables/profile/useProfileImages'

defineProps({
  /** Empty: no cover yet (the theme colour shows). */
  coverImage: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  displayName: { type: String, default: '' },
  loadError: { type: String, default: '' },
  isDark: { type: Boolean, default: false },
  username: { type: String, default: '' },
  /** Your own profile: edit, theme and sign-out buttons; anyone else's: Follow. */
  isOwner: { type: Boolean, default: false },
  /** Who the Follow button follows (a member id, or atproto:<did>). */
  followId: { type: String, default: '' },
  /** A Bluesky account's DID: shows Report (to Meeovi's Ozone). */
  reportDid: { type: String, default: '' },
  tab: { type: String, default: 'discussions' },
  tabs: {
    type: Array,
    default: () => [
      { value: 'discussions', label: 'Discussions' },
      { value: 'about', label: 'About' },
      { value: 'vibez', label: 'Vibez' },
      { value: 'connect', label: 'Connect with Me' },
    ],
  },
})

const emit = defineEmits(['update:tab', 'toggle-theme', 'sign-out', 'update:cover', 'update:avatar'])

// Your own profile: change the cover and avatar right here.
const images = useProfileImages()
const coverPicker = ref(null)
const avatarPicker = ref(null)
const picked = (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  return file
}
const onCover = async (event) => {
  const url = await images.changeCover(picked(event))
  if (url) emit('update:cover', url)
}
const removeCover = async () => {
  const url = await images.removeCover()
  if (url === null) emit('update:cover', '')
}
const onAvatar = async (event) => {
  const url = await images.changeAvatar(picked(event))
  if (url) emit('update:avatar', url)
}
</script>

<style scoped>
.cover-wrap {
  width: 100%;
}

.cover-wrap {
  position: relative;
}

.cover-wrap--empty {
  height: 360px;
  background-image: linear-gradient(135deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, .35) 100%);
}

.cover-image {
  height: 360px;
}

.cover-actions {
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  z-index: 1;
}

.avatar-wrap {
  position: relative;
}

.avatar-change {
  position: absolute;
  right: 10px;
  bottom: 10px;
}

.profile-head {
  margin-top: -74px;
  position: relative;
}

.profile-avatar {
  border: 4px solid white;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
  background: white;
}

@media (max-width: 960px) {
  .cover-image,
  .cover-wrap--empty {
    height: 240px;
  }

  .cover-actions {
    right: 12px;
    bottom: 12px;
  }

  .profile-head {
    margin-top: -54px;
  }

  .profile-avatar {
    width: 120px !important;
    height: 120px !important;
  }
}
</style>
