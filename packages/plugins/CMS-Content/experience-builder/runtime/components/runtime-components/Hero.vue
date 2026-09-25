<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
}>()
</script>

<template>
  <section class="spaces-hero">
    <div class="spaces-hero__content">
      <h1 class="spaces-hero__title">{{ title }}</h1>
      <p v-if="subtitle" class="spaces-hero__subtitle">
        {{ subtitle }}
      </p>
      <a
        v-if="ctaLabel && ctaHref"
        class="spaces-hero__cta"
        :href="ctaHref"
      >
        {{ ctaLabel }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.spaces-hero {
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #111827, #1f2937);
  color: #fff;
}
.spaces-hero__title {
  font-size: 2rem;
  font-weight: 700;
}
.spaces-hero__subtitle {
  margin-top: 0.5rem;
  opacity: 0.85;
}
.spaces-hero__cta {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background: #f9fafb;
  color: #111827;
  text-decoration: none;
}
</style>
