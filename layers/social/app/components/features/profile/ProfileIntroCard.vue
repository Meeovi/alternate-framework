<template>
  <ProfileSectionCard title="Intro">
    <div v-if="username" class="mb-2"><strong>Username:</strong> @{{ username }}</div>
    <div class="mb-2"><strong>Member ID:</strong> {{ memberId }}</div>
    <div><strong>Role:</strong> {{ role }}</div>
  </ProfileSectionCard>
</template>

<script setup>
import ProfileSectionCard from './ProfileSectionCard.vue'

defineProps({
  username: { type: String, default: '' },
  memberId: { type: [String, Number], default: '-' },
  role: { type: String, default: '' },
})
</script>
