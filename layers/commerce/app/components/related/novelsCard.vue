<template>
  <!-- A character on elitenovels.com (from /api/commerce/elitenovels). -->
  <a :href="character?.url" class="elite-link">
    <v-card class="elite-card ma-2 mx-auto" height="400" width="250" max-width="100%">
      <img v-if="character?.image" class="elite-img" :src="character.image" :alt="character?.name" loading="lazy" />
      <img v-else class="elite-img" src="../../assets/images/coming_soon.png" alt="" loading="lazy" />
      <v-card-title class="pt-4">{{ character?.name }}</v-card-title>
      <v-card-subtitle v-if="character?.alias">{{ character.alias }}</v-card-subtitle>
    </v-card>
  </a>
</template>

<script setup>
  defineProps({
    character: {
      type: Object,
      required: true,
    },
  })
</script>

<style scoped>
.elite-link {
  text-decoration: none;
  color: inherit;
}

.elite-img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  display: block;
}
</style>
