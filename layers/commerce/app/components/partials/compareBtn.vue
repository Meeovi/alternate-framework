<template>
  <SfButton size="sm" variant="tertiary" @click="handleCompare" :disabled="isInCompare">
    <template #prefix>
      <SfIconCompareArrows size="sm" />
    </template>
    {{ buttonText }}
  </SfButton>
</template>

<script setup lang="ts">
  import { computed } from '#imports';
  import { useCompareStore } from '../../stores/compare';
  import { useNuxtApp } from '#imports';
  import type { Product } from '../../types/product';

  // Define props
  const props = defineProps<{ product: Product }>();

  const compareStore = useCompareStore();
  const { $dataClient } = useNuxtApp() as any;

  // Check if the product is already in compare list
  const isInCompare = computed(() => {
    return compareStore.getComparedProducts.some((product: { sku: string; }) => product.sku === props.product?.sku) || compareStore.getComparedProductSkus.includes(props.product?.sku);
  });

  // Dynamically update v-btn text
  const buttonText = computed(() => (isInCompare.value ? 'In Compare List' : 'Add to Compare'));

  // Handle Add/Remove from Compare list using Data where possible
  const handleCompare = async () => {
    try {
      if (!props.product || !props.product.sku) {
        throw new Error('Product data is required');
      }

      const sku = props.product.sku;

      if (isInCompare.value) {
        // Remove from Data compare_items collection if exists
        try {
          const itemsRes = await $dataClient.$readItems('compare_items', { filter: { sku: { _eq: sku } } });
          const items = itemsRes?.data || itemsRes || [];
          for (const it of items) {
            const id = it.id || it._id || it.ID;
            if (id) await $dataClient.$deleteItem('compare_items', id);
          }
        } catch (e) {
          // ignore Data errors, still update local store
          console.warn('Data remove compare item failed:', e);
        }

        compareStore.removeComparedProduct(sku);
      } else {
        // Add to Data compare_items collection
        try {
          await $dataClient.$createItem('compare_items', { sku });
        } catch (e) {
          console.warn('Data create compare item failed:', e);
        }

        compareStore.addComparedProductSku(sku);
      }
    } catch (error) {
      console.error('Error handling compare:', error);
    }
  };
</script>