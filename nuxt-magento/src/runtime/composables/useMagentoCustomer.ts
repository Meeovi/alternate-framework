export const useMagentoCustomer = () => {
  return {
    me: () => $fetch('/api/magento/customer'),

    login: (payload: { email: string; password: string }) =>
      $fetch('/api/magento/auth-login', {
        method: 'POST',
        body: payload
      }),

    logout: () =>
      $fetch('/api/magento/auth-logout', {
        method: 'POST'
      })
  }
}
