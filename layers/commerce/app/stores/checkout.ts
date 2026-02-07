import { defineStore } from 'pinia';

export const useCheckoutStore = defineStore('checkout', {
    state: (): { shippingAddress: string | null; paymentMethod: any; orderId: string; isLoading: boolean } => ({
        shippingAddress: null,
        paymentMethod: null,
        orderId: '',
        isLoading: false
    }),
    actions: {
        setShippingAddress(address: string) {
            this.shippingAddress = address;
        },
        setPaymentMethod(method: string) {
            this.paymentMethod = method;
        }
    }
});
