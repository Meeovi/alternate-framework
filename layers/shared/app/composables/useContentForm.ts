import { ref, provide } from 'vue'
import useContentRequest from './useContentRequest'
import type { Ref } from 'vue'

export function useContentForm(collectionName: string, fieldsRef: Ref<any[]>, opts?: { clearOnSuccess?: boolean, closeDialogRef?: Ref<boolean> }) {
  const form = ref<Record<string, any>>({})
  const formError = ref<string | null>(null)
  const formSuccess = ref<string | null>(null)

  provide('contentForm', {
    form,
    fields: fieldsRef,
  })

  const submitForm = async () => {
    formError.value = null
    formSuccess.value = null

    for (const field of fieldsRef.value) {
      if (field.meta?.validation) {
        try {
          const validation = field.meta.validation
          if (validation._and) {
            for (const rule of validation._and) {
              const fieldName = Object.keys(rule)[0]
              if (!fieldName) continue
              const ruleDef = (rule as any)[fieldName]
              if (ruleDef && ruleDef._regex) {
                const regex = new RegExp(ruleDef._regex)
                const valueToTest = String(form.value[field.field] ?? '')
                if (!regex.test(valueToTest)) {
                  formError.value = field.meta.validation_message || field.meta.field + ' failed validation'
                  return
                }
              }
            }
          }
        } catch (_) {}
      }
    }

    const { createItem } = useContentRequest()
    const result = await createItem(collectionName, form.value)
    if (result?.error) {
      formError.value = result?.error?.message || String(result)
      return
    }
    formSuccess.value = `${collectionName} created successfully`

    if (opts?.clearOnSuccess) form.value = {}
    if (opts?.closeDialogRef) {
      try { opts.closeDialogRef.value = false } catch (_) {}
    }
  }

  return { form, formError, formSuccess, submitForm }
}

export default useContentForm