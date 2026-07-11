import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfCompanyAccount } from '~/composables/system/models'

export function useCompanyAccounts() {
  const client = getCommerceClient() as CommerceClient

  async function listCompanyAccounts(params: Record<string, any> = {}): Promise<SfCompanyAccount[]> {
    return client.listCompanyAccounts(params)
  }

  async function getCompanyAccountById(id: string): Promise<SfCompanyAccount | null> {
    return client.getCompanyAccountById(id)
  }

  async function createCompanyAccount(data: Partial<SfCompanyAccount>) {
    return client.createCompanyAccount(data)
  }

  async function updateCompanyAccount(id: string, data: Partial<SfCompanyAccount>) {
    return client.updateCompanyAccount({ id, ...data })
  }

  async function deleteCompanyAccount(id: string) {
    return client.deleteCompanyAccount(id)
  }

  return {
    listCompanyAccounts,
    getCompanyAccountById,
    createCompanyAccount,
    updateCompanyAccount,
    deleteCompanyAccount,
  }
}

export default useCompanyAccounts
