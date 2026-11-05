<template>
  <v-sheet class="emptyCategory text-center mx-auto my-10 pa-8" max-width="640" rounded="lg" border>
    <v-icon icon="fas fa-seedling" size="40" color="primary" class="mb-4" />
    <h2 class="text-h5 mb-2">Be the First to Shape This Space</h2>
    <p class="text-medium-emphasis mb-6">
      This {{ kind }} doesn't have any content yet. Upload content, add products, and help others discover
      something new.
    </p>
    <div class="d-flex flex-wrap justify-center ga-3">
      <v-btn to="/connect/media" color="primary" variant="flat" prepend-icon="fas fa-cloud-arrow-up">
        Upload Content
      </v-btn>
      <v-btn :to="addProductLink" color="primary" variant="outlined" prepend-icon="fas fa-plus">
        Add Product
      </v-btn>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  // Shown where a department or category has no products yet. "Add Product"
  // opens the seller's Add-product form with this department (and category)
  // already chosen.
  const props = defineProps<{
    kind?: 'category' | 'department'
    departmentId?: number | string | null
    categoryId?: number | string | null
  }>()

  const kind = computed(() => props.kind || 'category')

  const addProductLink = computed(() => ({
    path: '/workspace/catalog/my-products',
    query: {
      add: '1',
      ...(props.departmentId ? { department: String(props.departmentId) } : {}),
      ...(props.categoryId ? { category: String(props.categoryId) } : {}),
    },
  }))
</script>
