<template>
  <v-container class="py-6">
    <v-toolbar flat>
      <v-toolbar-title>Quotes</v-toolbar-title>
    </v-toolbar>

    <v-list>
      <v-list-item
        v-for="quote in quotes"
        :key="quote.id"
        :title="quote.user.name"
        :subtitle="quote.content"
      >
        <template #prepend>
          <v-avatar size="40">
            <img :src="quote.user.avatar" alt="" />
          </v-avatar>
        </template>

        <template #append>
          <v-btn icon="mdi-open-in-new" @click="open(quote.id)" />
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePosts } from '@/layers/social/composables/usePosts'

const route = useRoute()
const router = useRouter()
const postId = route.params.id

const quotes = ref([])

const { getQuotes } = usePosts()

onMounted(async () => {
  quotes.value = await getQuotes(postId)
})

function open(id) {
  router.push(`/social/posts/${id}`)
}
</script>
