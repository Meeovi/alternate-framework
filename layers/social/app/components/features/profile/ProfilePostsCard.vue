<template>
  <ProfileSectionCard :title="title" :status="status" :available="available" :mt="mt">
    <div v-if="showActions" class="d-flex ga-2 mb-3">
      <v-btn variant="outlined" prepend-icon="fas fa-table-list" to="/connect/feeds">Timeline</v-btn>
      <v-btn variant="outlined" prepend-icon="fas fa-rss" to="/connect">Explore</v-btn>
    </div>

    <ProfileEntityList
      :items="posts"
      :available="available"
      :message="message"
      icon="fas fa-pen"
      :title-keys="['title', 'name', 'content']"
      :subtitle-keys="['slug', 'date_created', 'date_published']"
      :key-keys="['id']"
      title-prefix="Post #"
      :to="postLink"
    />
  </ProfileSectionCard>
</template>

<script setup>
import ProfileSectionCard from './ProfileSectionCard.vue'
import ProfileEntityList from './ProfileEntityList.vue'

defineProps({
  title: { type: String, default: 'Recent Posts' },
  posts: { type: Array, default: () => [] },
  available: { type: Boolean, default: false },
  message: { type: String, default: '' },
  status: { type: Boolean, default: false },
  showActions: { type: Boolean, default: false },
  mt: { type: Boolean, default: false },
})

const postLink = (post) => (post?.slug ? `/connect/post/${post.slug}` : '/connect')
</script>
