import { computed, ref, toRefs } from 'vue';
import { getCommerceClient } from '../../../utils/client';
import { useAsyncData, useState } from '#imports';
import type { SfProduct } from '../../system/models';
import type {
  SwatchAttribute,
  UseSwatchesState,
  UseSwatches,
  UseSwatchesReturn,
  UseSwatchesComputed,
  FetchSwatches,
} from '../../../types/swatches';

/**
 * @description Composable for managing swatches.
 * @returns {@link UseSwatches}
 * @example
 * const { data, loading, fetchSwatches } = useSwatches();
 */
export const useSwatches: UseSwatchesReturn = (): UseSwatches & UseSwatchesComputed => {
  const state = useState<UseSwatchesState>('swatches', () => ({
    data: null,
    loading: false,
  }));

  /**
   * @description Function for fetching swatches.
   * @example
   * getSwatches();
   */
  const fetchSwatches: FetchSwatches = async () => {
    state.value.loading = true;
    const client = getCommerceClient();
    if (!client || typeof (client as any).listSwatches !== 'function') {
      state.value.data = [] as unknown as UseSwatchesState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseSwatchesState['data']>;
    }

    const { data, error } = await useAsyncData('commerce:swatches:list', () => (client as any).listSwatches());
    if (error.value) {
      // Keep startup resilient when provider is not configured.
      state.value.data = [] as unknown as UseSwatchesState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseSwatchesState['data']>;
    }

    state.value.data = data.value as unknown as UseSwatchesState['data'];
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<UseSwatchesState['data']>;
  };

  const findAttribute = (attributeCode: string): SwatchAttribute | undefined =>
    state.value.data?.find((a: SwatchAttribute) => a.attributeCode === attributeCode);

  const getSwatchOptions: UseSwatchesComputed['getSwatchOptions'] = (attributeCode) => {
    return findAttribute(attributeCode)?.options ?? [];
  };

  const getSelectedSwatch: UseSwatchesComputed['getSelectedSwatch'] = (attributeCode, value) => {
    return findAttribute(attributeCode)?.options.find((o) => o.value === value);
  };

  const getProductSwatchImage: UseSwatchesComputed['getProductSwatchImage'] = (product: SfProduct, attributeCode: string) => {
    const selectedValue = (product as any)?.attributes?.[attributeCode];
    if (selectedValue === undefined) return undefined;
    return getSelectedSwatch(attributeCode, selectedValue)?.swatchValue;
  };

  return {
    ...toRefs(state.value),
    fetchSwatches,
    getSwatchOptions,
    getSelectedSwatch,
    getProductSwatchImage,
  };
};
