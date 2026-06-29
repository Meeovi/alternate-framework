<!-- components/social/RepostComposer.vue -->
<template>
  <v-card class="pa-4">
    <v-textarea
      v-model="text"
      label="Add a comment"
      rows="3"
    />

    <v-file-input
      v-model="files"
      label="Attach media"
      multiple
      prepend-icon="mdi-image"
      class="mt-3"
    />

    <v-card-actions class="mt-2">
      <v-spacer />
      <v-btn text @click="reset">Cancel</v-btn>
      <v-btn color="primary" @click="submit">Repost</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePosts } from '../../../composables/posts/usePosts'

const props = defineProps({
  postId: { type: [String, Number], required: true }
})
const emit = defineEmits(['posted'])

const text = ref('')
const files = ref<File[] | null>(null)

const { repost } = usePosts()

function reset() {
  text.value = ''
  files.value = null
}

async function submit() {
  const res = await repost(props.postId, {
    comment: text.value,
    media: files?.value || []
  })
  emit('posted', res)
  reset()
}
</script>
