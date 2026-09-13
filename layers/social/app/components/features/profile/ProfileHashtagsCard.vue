<template>
  <ProfileSectionCard title="Hashtags">
    <template #title-append>
      <v-btn size="small" variant="text" to="/connect/hashtags">See all</v-btn>
    </template>

    <ProfileEntityList
      :items="hashtags"
      :available="available"
      :message="message"
      icon="fas fa-hashtag"
      :limit="4"
      :title-keys="['name', 'slug']"
      :subtitle-keys="['description']"
      :key-keys="['id', 'slug', 'name']"
      :to="hashtagLink"
    />
  </ProfileSectionCard>
</template>

<script setup>
import ProfileSectionCard from './ProfileSectionCard.vue'
import ProfileEntityList from './ProfileEntityList.vue'

defineProps({
  hashtags: { type: Array, default: () => [] },
  available: { type: Boolean, default: false },
  message: { type: String, default: '' },
})

const hashtagLink = (tag) => (tag?.slug ? `/connect/hashtag/${tag.slug}` : '/connect/hashtags')
</script>
