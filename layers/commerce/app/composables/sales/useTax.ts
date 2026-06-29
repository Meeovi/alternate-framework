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
    UseTaxReturn,
    TaxItem
} from '../../types/tax';
import type { SfTaxRate, SfTaxRule, SfTaxClass } from '~/composables/system/models/shared'

export function useTax(): UseTaxReturn {
    const state = ref < {
        data: (SfTaxRate | SfTaxRule | SfTaxClass)[] | null;
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

        if (!client || typeof (client as any).listTax === 'function') {
            if ((client as any).listTaxRates) {
                try {
                    const rates = await (client as any).listTaxRates()
                    state.value.data = Array.isArray(rates) ? rates.map((rate: any) => ({
                        id: rate.id,
                        type: 'VAT',
                        rate: rate.rate,
                    })) : []
                } catch (e) {
                    state.value.data = []
                }
            } else {
                state.value.data = [];
                state.value.loading = false;
                return computed(() => state.value.data) as unknown as Ref < any > ;
            }
        } else {
            try {
                const data = await (client as any).listTax();
                state.value.data = data;
            } catch (error) {
                state.value.data = [];
                state.value.error = error;
            }
        }

        state.value.loading = false;
        return computed(() => state.value.data) as unknown as Ref < any > ;
    };

    const fixProductTax = (product: any) => {
        if (!product) return product;

        const matchedTax = state.value.data?.find((t: any) => t.id === product.taxId);

        if (!matchedTax) {
            return product;
        }

        if (matchedTax.type === 'WEEE' || matchedTax.type === 'DEEE') {
            const details = matchedTax.weeeDetails;

            product.tax = {
                id: matchedTax.id,
                type: matchedTax.type,
                category: details?.category,
                ecoContribution: details?.fixedEcoContribution || 0
            };

            product.basePrice = product.price;
            product.totalPrice = product.price + product.tax.ecoContribution;
        } else {
            product.tax = matchedTax;
            product.totalPrice = product.price * (1 + (matchedTax.rate || 0) / 100);
        }

        return product;
    };

    const fixProductsTax = (products: any[]) => {
        return products.map((product) => fixProductTax(product));
    };

    return {
        ...toRefs(state.value),
        fetchTax,
        fixProductsTax,
        fixProductTax,
    } as unknown as UseTaxReturn;
}
