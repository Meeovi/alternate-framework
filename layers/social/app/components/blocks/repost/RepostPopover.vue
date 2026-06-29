<template>
  <v-menu open-on-hover>
    <template #activator="{ props }">
      <span v-bind="props">
        <slot />
      </span>
    </template>

    <v-card>
      <v-card-title>Reposted by</v-card-title>
      <v-list>
        <v-list-item
          v-for="user in users"
          :key="user.id"
          :title="user.name"
        />
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePosts } from '../../../composables/posts/usePosts'

const props = defineProps({
  postId: { type: [String, Number], required: true }
})

const users = ref([])

const { getReposts } = usePosts()

onMounted(async () => {
  users.value = await getReposts(props.postId)
})
</script>
