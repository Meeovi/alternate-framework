<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useExperiencePage } from '../composables/useExperiencePage'
import { resolveRuntimeComponent } from '../registry/helpers/resolveComponents'

const props = defineProps<{
  entityType: string
  entityId: string
  slug: string
}>()

const loading = ref(true)
const error = ref<Error | null>(null)
const project = ref<any | null>(null)

const { fetchPage } = useExperiencePage()

async function load () {
  loading.value = true
  try {
    const page = await fetchPage(props.entityType, props.entityId, props.slug)
    project.value = page?.data || null
  } catch (e: any) {
    error.value = e
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="spaces-page">
    <div v-if="loading" class="spaces-page__loading">
      Loading page…
    </div>
    <div v-else-if="error" class="spaces-page__error">
      Failed to load page.
    </div>
    <div v-else-if="!project" class="spaces-page__empty">
      No content yet.
    </div>
    <div v-else class="spaces-page__content">
      <!-- Very simplified: iterate root components -->
      <component
        v-for="(cmp, idx) in project.pages?.[0]?.frames?.[0]?.components || []"
        :is="resolveRuntimeComponent(cmp)?.def.vueComponent"
        v-bind="resolveRuntimeComponent(cmp)?.props"
        :key="idx"
      />
    </div>
  </div>
</template>

<style scoped>
.spaces-page__loading,
.spaces-page__error,
.spaces-page__empty {
  padding: 1rem;
}
</style>
