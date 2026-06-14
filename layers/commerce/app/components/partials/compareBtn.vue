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
  type Product = { sku: string };

  const props = defineProps<{ product: Product }>();

  const compareStore = useCompareStore();
  const { $directus, $readItems, $deleteItem, $createItem } = useNuxtApp() as any;

  const isInCompare = computed(() => {
    return compareStore.getComparedProductSkus.includes(props.product?.sku);
  });

  const buttonText = computed(() => (isInCompare.value ? 'In Compare List' : 'Add to Compare'));

  const handleCompare = async () => {
    try {
      if (!props.product || !props.product.sku) {
        throw new Error('Product data is required');
      }

      const sku = props.product.sku;

      if (isInCompare.value) {
        try {
          const itemsRes = await $directus.request($readItems('compare_items', { filter: { sku: { _eq: sku } } }))
          const items = itemsRes?.data || itemsRes || [];
          for (const it of items) {
            const id = it.id || it._id || it.ID;
            if (id) await $directus.request($deleteItem('compare_items', id))
          }
        } catch (e) {
          console.warn('Data remove compare item failed:', e);
        }
        compareStore.productSkus = compareStore.productSkus.filter((s: string) => s !== sku);
      } else {
        try {
          await $directus.request($createItem('compare_items', { sku }))
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