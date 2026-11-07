<template>
  <section v-if="items.length || canEdit" class="vibe-product-list">
    <div class="d-flex align-center mb-2">
      <h3 class="vibe-product-list__title">
        <v-icon icon="fas fa-bag-shopping" size="small" class="mr-1" />
        {{ items.length ? `Shop this vibe (${items.length})` : 'Shop this vibe' }}
      </h3>
      <v-spacer />
      <v-btn v-if="canEdit" size="small" variant="tonal" prepend-icon="fas fa-tag" @click="$emit('edit')">
        {{ items.length ? 'Edit products' : 'Tag products' }}
      </v-btn>
    </div>
    <p v-if="!items.length" class="text-body-2 text-medium-emphasis">
      Tag the products in your vibe so people can shop them while they watch.
    </p>
    <div class="vibe-product-list__items">
      <vibeProductMini v-for="item in items" :key="item.id" :product="item.product"
        :at="item.start !== null ? formatSeconds(item.start) : undefined" class="vibe-product-list__item"
        @click.capture="onClick($event, item)" />
    </div>
  </section>
</template>

<script setup lang="ts">
import vibeProductMini from './vibeProductMini.vue'
import { formatSeconds, type VibeProduct } from '../../../../composables/vibez/useVibeProducts'

/**
 * "Shop this vibe": every product tagged on it, under the player. A timed
 * product's "at 1:15" seeks the video there (emits `seek`).
 */
defineProps<{ items: VibeProduct[], canEdit?: boolean }>()
const emit = defineEmits<{ edit: [], seek: [seconds: number] }>()

function onClick(event: MouseEvent, item: VibeProduct) {
  // Only the "at 1:15" text seeks; links and buttons keep working.
  const target = event.target as HTMLElement | null
  if (item.start !== null && target?.closest('.text-medium-emphasis')) emit('seek', item.start)
}
</script>

<style scoped>
/* The site's global h3 is display-sized. */
.vibe-product-list__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
}

.vibe-product-list__items {
  display: grid;
  gap: 8px;
}

.vibe-product-list__item {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.vibe-product-list__item :deep(.text-medium-emphasis) {
  cursor: pointer;
}
</style>
