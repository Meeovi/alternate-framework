<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props" variant="text">
        <v-icon icon="mdi-repeat" />
      </v-btn>
    </template>

    <v-list>
      <v-list-item @click="onRepost">
        <v-list-item-title>{{ reposted ? 'Undo Repost' : 'Repost' }}</v-list-item-title>
      </v-list-item>

      <v-list-item @click="onQuote">
        <v-list-item-title>Quote Post</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { ref } from 'vue'
import { usePosts } from '../../../composables/posts/usePosts'
import { openQuoteModal } from '../QuotePostModal.vue'

const props = defineProps({
  postId: { type: [String, Number], required: true }
})

const { toggleRepost, isReposted } = usePosts()
const reposted = ref(false)

onMounted(async () => {
  const res = await isReposted(props.postId)
  reposted.value = !!(res?.reposted ?? res)
})

function onRepost() {
  toggleRepost(props.postId).then(res => {
    reposted.value = !!(res?.reposted ?? res)
  })
}

function onQuote() {
  openQuoteModal()
}
</script>
