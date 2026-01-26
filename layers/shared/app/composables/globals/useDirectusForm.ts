import { ref, provide } from 'vue'
import type { Ref } from 'vue'

export function useDirectusForm(collectionName: string, fieldsRef: Ref<any[]>, opts?: { clearOnSuccess?: boolean, closeDialogRef?: Ref<boolean> }) {
  const form = ref<Record<string, any>>({})
  const formError = ref<string | null>(null)
  const formSuccess = ref<string | null>(null)

  // provide form context for DirectusFormElement children
  provide('directusForm', {
    form,
    fields: fieldsRef,
  })

  const submitForm = async () => {
    formError.value = null
    formSuccess.value = null

    // Validate form data against field validation rules
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
                  console.error(
                    `Validation failed for ${field.field}: ${field.meta.validation_message || 'Invalid format'}`)
                  return // Stop submission if validation fails
                }
              }
            }
          }
        } catch (err) {
          console.error(`Error parsing validation for ${field.field}:`, err)
        }
      }
    }

    const { $directus, $createItem } = useNuxtApp() as any
    const result = await $directus.request($createItem(collectionName, form.value))
    if (result.error) {
      formError.value = result.error.message
      console.error(`Error creating ${collectionName}:`, result.error)
      return // Stop submission if error occurs
    }
    formSuccess.value = `${collectionName} created successfully`

    if (opts?.clearOnSuccess) {
      form.value = {}
    }
    if (opts?.closeDialogRef) {
      try { opts.closeDialogRef.value = false } catch (e) {}
    }
  }

  return {
    form,
    formError,
    formSuccess,
    submitForm,
  }
}
