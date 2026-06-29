<!-- components/social/RepostNotifications.vue -->
<template>
  <v-card>
    <v-card-title>Repost Activity</v-card-title>
    <v-list>
      <v-list-item
        v-for="n in notifications"
        :key="n.id"
        :title="n.user"
        :subtitle="n.message"
      >
        <template #prepend>
          <v-avatar size="32">
            <img :src="n.avatar" alt="" />
          </v-avatar>
        </template>
        <template #append>
          <span class="time">{{ n.time }}</span>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
const props = defineProps({
  notifications: {
    type: Array,
    default: () => [] // [{ id, user, avatar, message, time }]
  }
})
</script>

<style scoped>
.time { font-size: 12px; opacity: 0.7; }
</style>
