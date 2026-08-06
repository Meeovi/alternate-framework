import { createCrudResource } from './useEnterpriseResource'

export const useSharedCatalogs = () => createCrudResource('sharedCatalog')
export default useSharedCatalogs
