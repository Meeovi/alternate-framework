<template>
  <ExperienceBuilderCanvas
    entity-type="space"
    :entity-id="space?.id"
    :slug="route.params.slug"
  />
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { useRoute } from 'vue-router'
import { useSpace } from '../../../../composables/spaces/useSpace'

const route = useRoute()
const { space } = useSpace()

useHead({
  title: space?.value?.name || 'Space Builder',
})
</script>