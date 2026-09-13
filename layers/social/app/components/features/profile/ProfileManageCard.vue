<template>
  <ProfileSectionCard title="Manage" mt>
    <div class="d-flex flex-column ga-2">
      <v-btn
        v-for="link in links"
        :key="link.to"
        variant="outlined"
        :prepend-icon="link.icon"
        :to="link.to"
      >
        {{ link.label }}
      </v-btn>
    </div>
  </ProfileSectionCard>
</template>

<script setup>
import { computed } from 'vue'
import ProfileSectionCard from './ProfileSectionCard.vue'

const props = defineProps({
  isSeller: { type: Boolean, default: false },
})

const links = computed(() => [
  { label: 'Gift Cards', icon: 'fas fa-gift', to: '/product/showcases' },
  { label: 'Subscriptions', icon: 'fas fa-repeat', to: '/product/showcases' },
  { label: 'Manage Spaces', icon: 'fas fa-users', to: '/connect/spaces' },
  { label: 'Hashtags', icon: 'fas fa-hashtag', to: '/connect/hashtags' },
  { label: 'Events', icon: 'fas fa-calendar', to: '/connect/events' },
  ...(props.isSeller ? [{ label: 'My Shop', icon: 'fas fa-store', to: '/shops' }] : []),
])
</script>
