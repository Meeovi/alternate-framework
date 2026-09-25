<template>
  <DynamicForm collection="posts" :enable-turnstile="false" @submitted="onSubmitted" />
</template>

<script setup>
import { DynamicForm } from '@mframework/meeovi-forms'

// The host (e.g. BottomFooter's dialog) closes on `saved`. On failure
// nothing is emitted — DynamicForm keeps the form open with a
// "please try again" message and the user's input intact.
const emit = defineEmits(['saved'])

// Fans out a "new post" notification to the author's followers — see
// layers/social/server/api/social/notify-followers.post.ts. Best-effort:
// the post is already saved by the time this runs, so a failure here must
// not surface as a form error.
function onSubmitted(created) {
  emit('saved', created)
  $fetch('/api/social/notify-followers', {
    method: 'POST',
    body: { contentType: 'post', itemId: created?.id },
  }).catch((error) => {
    console.error('[add-post] failed to notify followers', error)
  })
}
</script>