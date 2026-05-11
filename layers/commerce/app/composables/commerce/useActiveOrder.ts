import { useCommerceQuery } from '../globals/useCommerceQuery'

export function useActiveOrder() {
  return useCommerceQuery('activeOrder') // Replace 'activeOrder' with the actual backend-agnostic identifier if needed
}
