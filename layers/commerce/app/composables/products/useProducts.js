import { getCommerceConfig } from '../config';
import { getProductProvider } from './registry';
export function useProducts() {
    const { productProvider } = getCommerceConfig();
    const provider = getProductProvider(productProvider);
    return {
        getProduct: provider.getProduct,
        listProducts: provider.listProducts
    };
}
