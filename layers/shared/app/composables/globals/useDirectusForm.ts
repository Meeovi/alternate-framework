import type { Ref } from 'vue'
import { useContentForm } from '../useContentForm'

export function useDirectusForm(
  collectionName: string,
  fieldsRef: Ref<any[]>,
  opts?: { clearOnSuccess?: boolean; closeDialogRef?: Ref<boolean> }
) {
  return useContentForm(collectionName, fieldsRef, opts)
}

export default useDirectusForm
