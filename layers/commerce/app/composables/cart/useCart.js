import { getCartProvider } from './registry';
import { useRuntimeConfig } from '#imports';
export function useCart() {
    const config = useRuntimeConfig();
    const providerName = config.public.cartProvider || 'directus';
    const provider = getCartProvider(providerName);
    return {
        getCart: provider.getCart,
        addItem: provider.addItem,
        removeItem: provider.removeItem,
        clearCart: provider.clearCart
    };
}
