import { computed, ref, toRefs } from 'vue';
import { getCommerceClient } from '../../../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';

/**
 * @description Composable for managing stock.
 * @returns {@link UseStock}
 * @example
 * const { data, loading, fetchStock } = useStock();
 */

export const useStock = () => {
  const state = useState('stock', () => ({
    data: null,
    loading: false,
  }));

  /**
   * @description Function for fetching stock.
   * @example
   * getStock();
   */
  const fetchStock = async () => {
    state.value.loading = true;
    const client = getCommerceClient();
    if (!client || typeof (client as any).listStock !== 'function') {
      state.value.data = [] as unknown as typeof state.value.data;
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<typeof state.value.data>;
    }

    const { data, error } = await useAsyncData('commerce:stock:list', () => (client as any).listStock());
    if (error.value) {
      // Keep startup resilient when provider is not configured.
      state.value.data = [] as unknown as typeof state.value.data;
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<typeof state.value.data>;
    }

    state.value.data = data.value as unknown as typeof state.value.data;
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<typeof state.value.data>;
  };

  const displayXStockLeft = (stock: number | null, threshold: number = 5): string => {
    if (stock === null || stock === undefined) {
      return '';
    }
    if (stock <= threshold) {
      return `Only ${stock} left in stock!`;
    }
    return '';
  };

  const displayStockAvailability = (stock: number | null): string => {
    if (stock === null || stock === undefined) {
      return 'Out of stock';
    }
    if (stock > 0) {
      return 'In stock';
    }
    return 'Out of stock';
  };

  const displayStockMSI = (stock: number | null, threshold: number = 5): string => {
    if (stock === null || stock === undefined) {
      return '';
    }
    if (stock <= threshold) {
      return `Only ${stock} left in stock!`;
    }
    return '';
  };

  return {
    ...toRefs(state.value),
    fetchStock,
    displayXStockLeft,
    displayStockAvailability,
    displayStockMSI,
  };
};