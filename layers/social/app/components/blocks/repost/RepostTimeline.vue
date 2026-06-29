<template>
  <v-list>
    <v-list-item
      v-for="item in items"
      :key="item.id"
      :title="item.user.name"
      :subtitle="item.createdAt"
    />
  </v-list>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePosts } from '../../../composables/posts/usePosts'

const props = defineProps({
  postId: { type: [String, Number], required: true }
})

const items = ref([])

const { getReposts } = usePosts()

onMounted(async () => {
  items.value = await getReposts(props.postId)
})
</script>
