<template>
  <div>
    <v-sheet class="cover-wrap" color="surface-variant" rounded="0">
      <v-img
        :src="coverImage"
        class="cover-image"
        cover
        gradient="to bottom, rgba(0,0,0,.12), rgba(0,0,0,.45)"
      >
        <div class="cover-actions">
          <v-btn variant="tonal" color="white" prepend-icon="fas fa-gear" to="/u/settings">
            Edit Profile
          </v-btn>
        </div>
      </v-img>
    </v-sheet>

    <v-container class="profile-head px-4 px-md-8">
      <v-row align="end" class="ma-0">
        <v-avatar size="168" class="profile-avatar" border="lg">
          <v-img :src="avatarUrl" :alt="displayName" cover />
        </v-avatar>

        <div class="profile-meta ml-4 mb-3">
          <h1 class="text-h4 font-weight-bold mb-1">{{ displayName }}</h1>
          <div class="text-medium-emphasis">{{ email }}</div>
          <div v-if="loadError" class="text-caption text-error mt-1">{{ loadError }}</div>
        </div>

        <v-spacer />

        <div class="mb-3 d-flex ga-2">
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

      <v-tabs
        :model-value="tab"
        class="mt-4"
        color="primary"
        grow
        @update:model-value="$emit('update:tab', $event)"
      >
        <v-tab v-for="t in tabs" :key="t.value" :value="t.value">{{ t.label }}</v-tab>
      </v-tabs>
    </v-container>
  </div>
</template>

<script setup>
defineProps({
  coverImage: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  displayName: { type: String, default: '' },
  email: { type: String, default: '' },
  loadError: { type: String, default: '' },
  isDark: { type: Boolean, default: false },
  tab: { type: String, default: 'timeline' },
  tabs: {
    type: Array,
    default: () => [
      { value: 'timeline', label: 'Timeline' },
      { value: 'about', label: 'About' },
      { value: 'commerce', label: 'Commerce' },
      { value: 'social', label: 'Social' },
    ],
  },
})

defineEmits(['update:tab', 'toggle-theme', 'sign-out'])
</script>

<style scoped>
.cover-wrap {
  width: 100%;
}

.cover-image {
  height: 360px;
}

.cover-actions {
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 20px;
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
  .cover-image {
    height: 240px;
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
