<template>
  <v-container class="py-6">
    <v-toolbar flat>
      <v-toolbar-title>Reposted by</v-toolbar-title>
    </v-toolbar>

    <v-list>
      <v-list-item
        v-for="user in users"
        :key="user.id"
        :title="user.name"
        :subtitle="user.handle"
      >
        <template #prepend>
          <v-avatar size="40">
            <img :src="user.avatar" alt="" />
          </v-avatar>
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePosts } from '@/layers/social/composables/usePosts'

const route = useRoute()
const postId = route.params.id

const users = ref([])

const { getReposts } = usePosts()

onMounted(async () => {
  users.value = await getReposts(postId)
})
</script>
