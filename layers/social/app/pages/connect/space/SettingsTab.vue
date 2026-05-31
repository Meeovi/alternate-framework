<template>
  <v-sheet>
    <template v-if="loggedIn && user && space && user.id === space.owner?.id">
      <SpaceSettings />
    </template>
    <template v-else-if="loggedIn">
      <div class="center-text">
        <FollowButton :entity-type="'space'" :entity-id="space?.id"
          :initial-following="space?.members?.some(m => m.user?.id === user?.id)"
          follow-label="Join" unfollow-label="Leave" />
        <v-btn class="ml-2" variant="plain">Mute Notifications</v-btn>
      </div>
    </template>
    <template v-else>
      <div class="center-text">Sign in to manage your membership or settings.</div>
    </template>
  </v-sheet>
</template>
<script setup>
defineProps({ space: Object, user: Object, loggedIn: Boolean })
import SpaceSettings from '#social/app/components/features/spaceSections/crud/update-space.vue'
import FollowButton from '#social/app/components/blocks/FollowButton.vue'
</script>
