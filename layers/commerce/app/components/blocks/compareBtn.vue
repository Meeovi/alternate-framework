<template>
  <div>
    <v-btn color="primary" variant="outlined" prepend-icon="fas fa-shuffle" @click="handleCompare" :disabled="isInCompare">
      {{ buttonText }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
  import { computed } from '#imports';
  import { useCompareStore } from '../../stores/compare';
  type Product = { sku: string };

  const props = defineProps<{ product: Product }>();

  const compareStore = useCompareStore();

  const isInCompare = computed(() => {
    return compareStore.getComparedProductSkus.includes(props.product?.sku);
  });

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