<template>
  <!-- A story on elitenovels.com (from /api/commerce/elitenovels). -->
  <a :href="story?.url" class="elite-link">
    <v-card class="elite-card ma-2 mx-auto" height="460" width="300" max-width="100%">
      <img v-if="story?.image" class="elite-img" :src="story.image" :alt="story?.name" loading="lazy" />
      <img v-else class="elite-img" src="../../assets/images/coming_soon.png" alt="" loading="lazy" />
      <v-card-subtitle v-if="published" class="pt-4">Published: {{ published }}</v-card-subtitle>
      <v-card-title class="text-wrap">{{ story?.name }}</v-card-title>
      <v-card-actions>
        <v-btn color="blue" variant="text">Read More</v-btn>
      </v-card-actions>
    </v-card>
  </a>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    story: {
      type: Object,
      required: true,
    },
  })

  const published = computed(() => (props.story?.date ? new Date(props.story.date).toLocaleDateString('en-GB') : ''))
</script>

<style scoped>
.elite-link {
  text-decoration: none;
  color: inherit;
}

.elite-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
}
</style>
