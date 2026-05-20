// removed invalid import: AdminTable is not exported from '@mframework/adapter-directus'
import type { ComponentExposed } from 'vue-component-type-helpers'
import { useTemplateRef } from 'vue'

type AdminTableExpose = {
  fetchTableData?: () => void
}

export function useAdminTable(refName: string = 'table') {
  const adminTableRef = useTemplateRef<ComponentExposed<AdminTableExpose>>(refName)
  const refresh = () => {
    (adminTableRef.value as unknown as AdminTableExpose)?.fetchTableData?.()
  }
  return {
    refresh
  }
}
