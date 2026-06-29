<!-- components/social/RepostEngagementPanel.vue -->
<template>
  <v-card class="pa-4">
    <v-card-title>Engagement</v-card-title>

    <v-row class="mt-4">
      <v-col cols="6" md="3" v-for="metric in metrics" :key="metric.key">
        <div class="metric">
          <div class="value">{{ metric.value }}</div>
          <div class="label">{{ metric.label }}</div>
        </div>
      </v-col>
    </v-row>

    <v-divider class="my-6" />

    <v-card-subtitle class="mb-2">Activity Over Time</v-card-subtitle>
    <v-sparkline :value="timeline" color="primary" smooth padding="16" />
  </v-card>
</template>

<script setup>
const props = defineProps({
  reposts: { type: Number, default: 0 },
  quotes: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  timeline: { type: Array, default: () => [0, 2, 4, 3, 6, 8, 10] }
})

const metrics = [
  { key: 'reposts', label: 'Reposts', value: props.reposts },
  { key: 'quotes', label: 'Quotes', value: props.quotes },
  { key: 'likes', label: 'Likes', value: props.likes },
  { key: 'bookmarks', label: 'Bookmarks', value: props.bookmarks },
  { key: 'views', label: 'Views', value: props.views }
]
</script>

<style scoped>
.metric { text-align: center; }
.value { font-size: 24px; font-weight: 700; }
.label { opacity: 0.7; }
</style>
