<template>
  <ProfileSectionCard title="My Spaces" :status="status" :available="available">
    <template #title-append>
      <v-btn v-if="!status" size="small" variant="text" to="/connect">See all</v-btn>
    </template>

    <div v-if="status" class="d-flex ga-2 mb-3">
      <v-btn variant="outlined" prepend-icon="fas fa-users" to="/connect/spaces">Browse Spaces</v-btn>
    </div>

    <ProfileEntityList
      :items="spaces"
      :available="available"
      :message="message"
      icon="fas fa-users"
      :limit="limit"
      :title-keys="['title', 'name']"
      :subtitle-keys="['slug', 'date_created']"
      :key-keys="['id']"
      title-prefix="Space #"
      :to="spaceLink"
    />
  </ProfileSectionCard>
</template>

<script setup>
import ProfileSectionCard from './ProfileSectionCard.vue'
import ProfileEntityList from './ProfileEntityList.vue'

defineProps({
  spaces: { type: Array, default: () => [] },
  available: { type: Boolean, default: false },
  message: { type: String, default: '' },
  // `false` → compact timeline card with a "See all" link + row limit.
  // `true` → full social-tab card with the status chip + browse button.
  status: { type: Boolean, default: false },
  limit: { type: Number, default: 0 },
})

const spaceLink = (space) => (space?.slug ? `/connect/space/${space.slug}` : '/connect')
</script>
