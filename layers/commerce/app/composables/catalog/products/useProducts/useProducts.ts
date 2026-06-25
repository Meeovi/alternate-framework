import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { FetchProducts, FetchProductsByIds, GetProducts, UseProducts, UseProductsReturn, UseProductsState } from './types';
import { getCommerceClient } from '../../../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import type { Maybe } from '../../../system/models/shared';

/**
 * @description Composable for managing products.
 * @returns {@link UseProducts}
 * @example
 * const { data, loading, fetchProducts } = useProducts();
 */
export const useProducts: UseProductsReturn = (): UseProducts => {
  const state = useState<UseProductsState>('products', () => ({
    data: null,
    loading: false,
    pagination: null,
    error: null,
  }));

  /**
   * @description Function for fetching products.
   * @example
   * getProducts();
   */
  const fetchProducts: FetchProducts = async () => {
    state.value.loading = true;
    const client = getCommerceClient();
    if (!client || typeof (client as any).listProducts !== 'function') {
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    const { data, error } = await useAsyncData('commerce:products:list', () => (client as any).listProducts());
    if (error.value) {
      // Keep startup resilient when provider is not configured.
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    state.value.data = data.value as unknown as UseProductsState['data'];
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
  };

  /**
   * @description Function for fetching configurable products.
   * @example
   * fetchConfigurableProducts();
   */
  const fetchConfigurableProducts: FetchProducts = async () => {
    state.value.loading = true;
    const client = getCommerceClient();
    if (!client || typeof (client as any).listConfigurableProducts !== 'function') {
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    const { data, error } = await useAsyncData('commerce:products:listConfigurable', () =>
      (client as any).listConfigurableProducts()
    );
    if (error.value) {
      // Keep startup resilient when provider is not configured.
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    state.value.data = data.value as unknown as UseProductsState['data'];
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
  };

  /**
   * @description Function for fetching bundle products.
   * @example
   * fetchBundleProducts();
   */
  const fetchBundleProducts: FetchProducts = async () => {
    state.value.loading = true;
    const client = getCommerceClient();
    if (!client || typeof (client as any).listBundleProducts !== 'function') {
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    const { data, error } = await useAsyncData('commerce:products:listBundle', () =>
      (client as any).listBundleProducts()
    );
    if (error.value) {
      // Keep startup resilient when provider is not configured.
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    state.value.data = data.value as unknown as UseProductsState['data'];
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
  };

  const fetchGroupedProducts: FetchProducts = async () => {
    state.value.loading = true;
    const client = getCommerceClient();
    if (!client || typeof (client as any).listGroupedProducts !== 'function') {
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    const { data, error } = await useAsyncData('commerce:products:listGrouped', () =>
      (client as any).listGroupedProducts()
    );
    if (error.value) {
      // Keep startup resilient when provider is not configured.
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    state.value.data = data.value as unknown as UseProductsState['data'];
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
  };

  const fetchDownloadableProducts: FetchProducts = async () => {
    state.value.loading = true;
    const client = getCommerceClient();
    if (!client || typeof (client as any).listDownloadableProducts !== 'function') {
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    const { data, error } = await useAsyncData('commerce:products:listDownloadable', () =>
      (client as any).listDownloadableProducts()
    );
    if (error.value) {
      // Keep startup resilient when provider is not configured.
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    state.value.data = data.value as unknown as UseProductsState['data'];
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
  };

  const fetchUpsellingProducts: FetchProducts = async () => {
    state.value.loading = true;
    const client = getCommerceClient();
    if (!client || typeof (client as any).listUpsellingProducts !== 'function') {
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    const { data, error } = await useAsyncData('commerce:products:listUpselling', () =>
      (client as any).listUpsellingProducts()
    );
    if (error.value) {
      // Keep startup resilient when provider is not configured.
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    state.value.data = data.value as unknown as UseProductsState['data'];
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
  };

  const fetchCrossSellingProducts: FetchProducts = async () => {
    state.value.loading = true;
    const client = getCommerceClient();
    if (!client || typeof (client as any).listCrossSellingProducts !== 'function') {
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    const { data, error } = await useAsyncData('commerce:products:listCrossSelling', () =>
      (client as any).listCrossSellingProducts()
    );
    if (error.value) {
      // Keep startup resilient when provider is not configured.
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    state.value.data = data.value as unknown as UseProductsState['data'];
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
  };

  const fetchProductsByIds: FetchProductsByIds = async (productIds: string[]) => {
    state.value.loading = true;
    const client = getCommerceClient();
    if (!client || typeof (client as any).listProductsByIds !== 'function') {
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    const { data, error } = await useAsyncData('commerce:products:listByIds', () =>
      (client as any).listProductsByIds(productIds)
    );
    if (error.value) {
      // Keep startup resilient when provider is not configured.
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    state.value.data = data.value as unknown as UseProductsState['data'];
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
  };

  return {
    fetchProducts,
    fetchConfigurableProducts,
    fetchBundleProducts,
    fetchGroupedProducts,
    fetchDownloadableProducts,
    fetchUpsellingProducts,
    fetchCrossSellingProducts,
    fetchProductsByIds,
    ...toRefs(state.value),
  };
};

