// stores/digital-products.js
export const useDigitalProducts = defineStore('digital-products', {
  state: () => ({
    downloads: {},
  }),
  actions: {
    downloadProduct(productId) {
      // Download logic
    },
  },
});
