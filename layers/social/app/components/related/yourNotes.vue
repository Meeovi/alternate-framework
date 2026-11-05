<template>
  <!-- The signed-in member's most recent notes, with a link to Notes.
       Personal, so it loads in the browser and is hidden for guests and
       members who haven't posted yet. -->
  <section v-if="notes.length" class="yourNotes">
    <v-toolbar title="Your recent notes" color="transparent">
      <v-btn variant="text" to="/connect/notes" append-icon="fas fa-arrow-right">See all notes</v-btn>
    </v-toolbar>
    <v-slide-group class="pa-4" show-arrows>
      <v-slide-group-item v-for="note in notes" :key="note.id">
        <postCard :post="note" class="ma-4 yourNotes__note" />
      </v-slide-group-item>
    </v-slide-group>
  </section>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { authClient } from '#auth/lib/auth-client'
  import postCard from './post.vue'

  const notes = ref([])
  onMounted(async () => {
    const { data } = await authClient.getSession().catch(() => ({ data: null }))
    const id = data?.user?.id
    if (!id) return
    // The member's own notes on Meeovi (the federation's "directus" network).
    const res = await $fetch('/api/social/federation/directus/feed', { query: { actor: id, limit: 12 } }).catch(() => null)
    notes.value = res?.posts ?? []
  })
</script>

<style scoped>
.yourNotes {
  padding: 0 12px;
}

.yourNotes__note {
  width: 320px;
}
</style>
