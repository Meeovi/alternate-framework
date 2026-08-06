import { createCrudResource } from './useEnterpriseResource'

export const useStoreCredit = () =>
  createCrudResource('storeCredit', {
    applyStoreCreditToCart: (client, cartId, amount) =>
      client.applyStoreCreditToCart({ cartId, amount }),
  })
export default useStoreCredit
