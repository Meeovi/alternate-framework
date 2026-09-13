<template>
  <ProfileSectionCard title="Events">
    <template #title-append>
      <v-btn size="small" variant="text" to="/connect/events">See all</v-btn>
    </template>

    <ProfileEntityList
      :items="events"
      :available="available"
      :message="message"
      icon="fas fa-calendar"
      :limit="4"
      :title-keys="['name', 'title']"
      :subtitle-keys="['slug', 'date_created']"
      :key-keys="['id', 'slug', 'name']"
      title-prefix="Event #"
      :to="eventLink"
    />
  </ProfileSectionCard>
</template>

<script setup>
import ProfileSectionCard from './ProfileSectionCard.vue'
import ProfileEntityList from './ProfileEntityList.vue'

defineProps({
  events: { type: Array, default: () => [] },
  available: { type: Boolean, default: false },
  message: { type: String, default: '' },
})

const eventLink = (event) => (event?.slug ? `/connect/event/${event.slug}` : '/connect')
</script>
