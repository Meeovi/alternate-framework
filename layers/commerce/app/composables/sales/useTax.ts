import {
    computed,
    ref,
    toRefs,
    type Ref
} from 'vue';
import {
    getCommerceClient
} from '../../utils/client';
import type {
    UseTaxReturn
} from '../../types/tax';

export function useTax(): UseTaxReturn {
    // 1. Explicitly type the ref state here
    const state = ref < {
        data: any[] | null;
        loading: boolean;
        error: any;
    } > ({
        data: null,
        loading: false,
        error: null,
    });

    const fetchTax = async () => {
        state.value.loading = true;
        state.value.error = null;
        const client = getCommerceClient();

        if (!client || typeof (client as any).listTax !== 'function') {
            state.value.data = [];
            state.value.loading = false;
            return computed(() => state.value.data) as unknown as Ref < any > ;
        }

        try {
            const data = await (client as any).listTax();
            state.value.data = data;
        } catch (error) {
            state.value.data = [];
            state.value.error = error;
        } finally {
            state.value.loading = false;
        }

        return computed(() => state.value.data) as unknown as Ref < any > ;
    };

    const fixProductTax = (product: any) => {
        if (!product) return product;

        // 1. Fetch matching tax policy from your state
        const matchedTax = state.value.data?.find((t: any) => t.id === product.taxId);

        if (!matchedTax) {
            return product;
        }

        // 2. Handle WEEE/DEEE Eco-Contribution Calculations
        if (matchedTax.type === 'WEEE' || matchedTax.type === 'DEEE') {
            const details = matchedTax.weeeDetails;

            // Save the raw regulatory details to the product payload
            product.tax = {
                id: matchedTax.id,
                type: matchedTax.type,
                category: details?.category,
                ecoContribution: details?.fixedEcoContribution || 0
            };

            // Standard DEEE rule: Display price must include or clearly break down the fee
            product.basePrice = product.price;
            product.totalPrice = product.price + product.tax.ecoContribution;
        } else {
            // Standard VAT fallback logic
            product.tax = matchedTax;
            product.totalPrice = product.price * (1 + (matchedTax.rate || 0) / 100);
        }

        return product;
    };

    const fixProductsTax = (products: any[]) => {
        return products.map((product) => fixProductTax(product));
    };

    // 3. Use toRefs(state) directly instead of state.value to maintain reactivity
    return {
        ...toRefs(state.value),
        fetchTax,
        fixProductsTax,
        fixProductTax,
    }as unknown as UseTaxReturn;
}