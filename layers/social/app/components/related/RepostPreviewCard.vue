<template>
  <v-card class="preview-card" variant="outlined">
    <v-card-title class="d-flex align-center">
      <v-avatar size="32" class="mr-3">
        <img :src="post.user.avatar" alt="" />
      </v-avatar>

      <div>
        <div class="name">{{ post.user.name }}</div>
        <div class="handle">@{{ post.user.handle }}</div>
      </div>
    </v-card-title>

    <v-card-text>
      <div class="content" v-html="post.content"></div>
    </v-card-text>

    <v-card-actions>
      <v-btn icon="mdi-open-in-new" @click="openPost" />
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  post: { type: Object, required: true }
})

const router = useRouter()

function openPost() {
  router.push(`/social/posts/${props.post.id}`)
}
</script>

<style scoped>
.preview-card {
  border-left: 3px solid #00ba7c;
  margin-top: 12px;
}
.name {
  font-weight: 600;
}
.handle {
  font-size: 13px;
  opacity: 0.7;
}
.content {
  white-space: pre-wrap;
}
</style>
