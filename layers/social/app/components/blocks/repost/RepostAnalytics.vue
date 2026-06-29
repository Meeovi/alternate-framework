<template>
  <v-card>
    <v-card-title>Post Analytics</v-card-title>

    <v-card-text>
      <v-row>
        <v-col>
          <div class="metric">
            <span class="value">{{ analytics.reposts }}</span>
            <span class="label">Reposts</span>
          </div>
        </v-col>

        <v-col>
          <div class="metric">
            <span class="value">{{ analytics.quotes }}</span>
            <span class="label">Quotes</span>
          </div>
        </v-col>

        <v-col>
          <div class="metric">
            <span class="value">{{ analytics.views }}</span>
            <span class="label">Views</span>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  analytics: {
    type: Object,
    default: () => ({ reposts: 0, quotes: 0, views: 0 })
  }
})
</script>

<style scoped>
.metric {
  text-align: center;
}
.value {
  font-size: 24px;
  font-weight: bold;
}
.label {
  opacity: 0.7;
}
</style>
