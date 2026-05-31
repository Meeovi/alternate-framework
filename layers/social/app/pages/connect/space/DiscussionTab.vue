<template>
  <div>
    <div v-if="space?.posts && space.posts.length">
      <div class="text-center" v-for="(discussions, idx) in space.posts" :key="discussions?.posts_id?.id || idx">
        <SpaceFeeds :discussion="discussions?.posts_id" />
      </div>
    </div>
    <div class="center-text" v-else>
      <p>No discussions yet</p>
    </div>
  </div>
</template>
<script setup>
defineProps({ space: Object })
import SpaceFeeds from '#social/app/components/related/post.vue'
</script>
