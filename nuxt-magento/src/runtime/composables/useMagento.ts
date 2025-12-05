export const useMagento = () => {
  const { $magento } = useNuxtApp()

  const query = async (gql: string, variables?: Record<string, any>) => {
    return await $magento('', {
      method: 'POST',
      body: { query: gql, variables }
    })
  }

  return { query }
}
