<template>
  <div>
    <NuxtLink :to="`/facet/${facet?.slug}`">
      <v-card class="elite-card ma-2 mx-auto" height="450" width="250" max-width="100%">
        <div v-if="facet?.image?.filename_disk">
          <img class="align-end text-white" height="250" :src="`${$directus.url}assets/${facet?.image?.filename_disk}`" :alt="facet?.name"
            cover />
        </div>

        <div v-else>
          <img class="align-end text-white" height="300" src="~/assets/images/coming_soon.png" cover />
        </div>
        <v-card-title class="pt-4">{{ facet?.name }}</v-card-title>
        <div class="d-flex fill-height align-center justify-center">
          <v-scale-transition>
            <v-icon color="white" size="48" icon="fas fa-circle-xmark"></v-icon>
          </v-scale-transition>
        </div>
      </v-card>
    </NuxtLink>
  </div>
</template>

<script setup>
  const props = defineProps({
    facet: {
      type: Object,
      required: true,
    },
  });
  const {
    facet
  } = props;
</script>