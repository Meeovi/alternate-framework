import { toRefs } from '@vueuse/shared';
import { getCommerceClient } from '../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../useHandleError';
/**
 * @description Composable for managing content from CMS.
 * @param url Parameter of the content to fetch.
 * @returns {@link UseContent}
 * @example
 * const { data, loading, getContent } = useContent<ContentFieldsType>('url');
 */
export const useContent = (url) => {
    const state = useState(`content-${url}`, () => ({
        data: null,
        loading: false,
    }));
    /**
     * @description Function for fetching the content.
     * @example
     * getContent();
     */
    const getContent = async () => {
        state.value.loading = true;
        try {
            const client = getCommerceClient();
            const result = await useAsyncData(() => client.listProducts?.());
            const { data, error } = result;
            useHandleError(error?.value ?? error);
            state.value.data = data.value;
            return data;
        }
        catch (error) {
            throw new Error(error);
        }
        finally {
            state.value.loading = false;
        }
    };
    return {
        getContent,
        ...toRefs(state.value),
    };
};
