<template>
  <ProfileSectionCard title="Intro">
    <div class="mb-2"><strong>Email:</strong> {{ email }}</div>
    <div class="mb-2"><strong>Member ID:</strong> {{ memberId }}</div>
    <div><strong>Role:</strong> {{ role }}</div>
  </ProfileSectionCard>
</template>

<script setup>
import ProfileSectionCard from './ProfileSectionCard.vue'

defineProps({
  email: { type: String, default: '' },
  memberId: { type: [String, Number], default: '-' },
  role: { type: String, default: '' },
})
</script>
