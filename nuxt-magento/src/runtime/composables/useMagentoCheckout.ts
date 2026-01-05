export const useMagentoCheckout = () => {
  return {
    checkout: (payload: any) =>
      $fetch('/api/magento/checkout', {
        method: 'POST',
        body: payload
      })
  }
}
