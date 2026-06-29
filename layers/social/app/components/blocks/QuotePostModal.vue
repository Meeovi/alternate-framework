<template>
  <v-dialog v-model="open" max-width="600">
    <v-card>
      <v-card-title>Quote Post</v-card-title>

      <v-card-text>
        <v-textarea
          v-model="text"
          label="Add your thoughts"
          rows="4"
        />

        <v-divider class="my-4" />

        <div class="quoted-post">
          <slot name="quoted" />
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="open = false">Cancel</v-btn>
        <v-btn color="primary" @click="submit">Post</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { usePosts } from '../../composables/posts/usePosts'

const props = defineProps({
  postId: { type: [String, Number], required: true }
})

const emit = defineEmits(['posted'])

const open = ref(false)
const text = ref('')

const { createPost } = usePosts()

function submit() {
  createPost({
    content: text.value,
    quotedPostId: props.postId
  }).then(res => {
    emit('posted', res)
    open.value = false
  })
}

export function openQuoteModal() {
  open.value = true
}
</script>

<style scoped>
.quoted-post {
  border-left: 3px solid #00ba7c;
  padding-left: 12px;
  opacity: 0.8;
}
</style>
