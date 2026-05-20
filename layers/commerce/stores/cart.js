import { ref, computed, readonly } from 'vue';
import { defineStore } from 'pinia';
export const useCartStore = defineStore('cart', () => {
    const items = ref([]);
    const loading = ref(false);
    const error = ref(null);
    function addItem(item) {
        items.value.push(item);
    }
    function removeItem(index) {
        items.value.splice(index, 1);
    }
    function clearCart() {
        items.value = [];
    }
    const itemCount = computed(() => items.value.length);
    return {
        items: readonly(items),
        loading: readonly(loading),
        error: readonly(error),
        itemCount,
        addItem,
        removeItem,
        clearCart
    };
});
