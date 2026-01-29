import { defineStore } from 'pinia';
export const useCheckoutStore = defineStore('checkout', {
    state: () => ({
        shippingAddress: null,
        paymentMethod: null,
        orderId: '',
        isLoading: false
    }),
    actions: {
        setShippingAddress(address) {
            this.shippingAddress = address;
        },
        setPaymentMethod(method) {
            this.paymentMethod = method;
        }
    }
});
