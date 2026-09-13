<template>
  <ProfileSectionCard title="Create Post">
    <v-textarea
      v-model="text"
      rows="3"
      auto-grow
      counter
      placeholder="What's on your mind?"
      variant="solo-filled"
      :disabled="submitting"
      hide-details="auto"
      @keydown.enter.exact.prevent="submit"
    />

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      density="compact"
      class="mt-3"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <div class="d-flex flex-wrap align-center ga-2 mt-3">
      <v-btn
        color="primary"
        prepend-icon="fas fa-paper-plane"
        :loading="submitting"
        :disabled="!canSubmit"
        @click="submit"
      >
        Post
      </v-btn>
      <v-btn variant="tonal" prepend-icon="fas fa-users" to="/connect/spaces">Create/Manage Space</v-btn>
      <v-btn variant="tonal" prepend-icon="fas fa-table-list" to="/connect/feeds">Open Timeline</v-btn>
      <span class="text-caption text-medium-emphasis ml-auto">Enter to post &middot; Shift+Enter for a new line</span>
    </div>
  </ProfileSectionCard>
</template>

<script setup>
import ProfileSectionCard from './ProfileSectionCard.vue'
import { useProfileComposer } from '../../../composables/profile/useProfileComposer'

const { text, submitting, error, canSubmit, submit } = useProfileComposer()
</script>
