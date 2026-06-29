<template>
  <v-card class="pa-4">
    <v-card-title>Post Insights</v-card-title>

    <v-row class="mt-4">
      <v-col cols="12" md="4">
        <div class="metric">
          <div class="value">{{ insights.reposts }}</div>
          <div class="label">Reposts</div>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <div class="metric">
          <div class="value">{{ insights.quotes }}</div>
          <div class="label">Quotes</div>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <div class="metric">
          <div class="value">{{ insights.views }}</div>
          <div class="label">Views</div>
        </div>
      </v-col>
    </v-row>

    <v-divider class="my-6" />

    <v-card-subtitle class="mb-2">Engagement Over Time</v-card-subtitle>

    <v-sparkline
      :value="insights.timeline"
      color="primary"
      smooth
      padding="16"
    />
  </v-card>
</template>

<script setup>
const props = defineProps({
  insights: {
    type: Object,
    default: () => ({
      reposts: 0,
      quotes: 0,
      views: 0,
      timeline: [0, 2, 4, 3, 6, 8, 10]
    })
  }
})
</script>

<style scoped>
.metric {
  text-align: center;
}
.value {
  font-size: 32px;
  font-weight: bold;
}
.label {
  opacity: 0.7;
}
</style>
