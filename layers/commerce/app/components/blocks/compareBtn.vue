<template>
  <div class="compare-btn">
    <v-btn color="primary" :variant="isInCompare ? 'tonal' : 'outlined'"
      :prepend-icon="isInCompare ? 'fas fa-check' : 'fas fa-shuffle'" :aria-pressed="isInCompare"
      :title="isInCompare ? 'Remove from compare' : undefined" @click="handleCompare">
      {{ buttonText }}
    </v-btn>
    <NuxtLink v-if="compareCount" to="/compare" class="compare-btn__link">
      View comparison ({{ compareCount }})
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from '#imports';
  import { useCompareStore } from '../../stores/compare';
  type Product = { sku: string };

  const props = defineProps<{ product: Product }>();

  const compareStore = useCompareStore();

  // The list lives in localStorage, so read it only after mounting: the
  // server always renders "Add to Compare", and so does hydration.
  const mounted = ref(false);
  onMounted(() => { mounted.value = true; });

  const isInCompare = computed(() => mounted.value && compareStore.getComparedProductSkus.includes(props.product?.sku));
  const compareCount = computed(() => (mounted.value ? compareStore.getComparedProductSkus.length : 0));

  const buttonText = computed(() => (isInCompare.value ? 'In Compare List' : 'Add to Compare'));

  // The compare list is purely local (Pinia + localStorage, see
  // stores/compare.ts) — this previously also tried to sync each add/
  // remove to a Directus `compare_items` collection that doesn't exist
  // (confirmed), silently failing on every click. Dropped rather than
  // fixed, since there's no reachable page anywhere that ever read that
  // collection back — the store's own persistence is the real source of
  // truth for /compare.
  const handleCompare = () => {
    if (!props.product || !props.product.sku) {
      console.error('Error handling compare: product data is required');
      return;
    }

    const sku = props.product.sku;

    if (isInCompare.value) {
      compareStore.removeComparedProductSku(sku);
    } else {
      compareStore.addComparedProductSku(sku);
    }
  };
</script>

<style scoped>
.compare-btn {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.compare-btn__link {
  font-size: 0.875rem;
}
</style>