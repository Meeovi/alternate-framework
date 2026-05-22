import { reactive, ref, unref, watchEffect, type Ref } from 'vue'
type DirectusFormOptions = {
  clearOnSuccess?: boolean
  closeDialogRef?: Ref<boolean>
}

export function useDirectusForm(collection: string, fields: any, options: DirectusFormOptions = {}) {
  const { createItem } = useSdkContentAdapter()

  const form = reactive<Record<string, any>>({})
  const formError = ref('')
  const formSuccess = ref('')

  watchEffect(() => {
    const resolvedFields = unref(fields) || []
    for (const field of resolvedFields) {
      if (!field?.field) continue
      if (!(field.field in form)) {
        form[field.field] = null
      }
    }
  })

  const submitForm = async () => {
    formError.value = ''
    formSuccess.value = ''

    try {
      await createItem(collection, { ...form })
      formSuccess.value = 'Saved successfully.'

      if (options.clearOnSuccess) {
        for (const key of Object.keys(form)) {
          form[key] = null
        }
      }

      if (options.closeDialogRef) {
        options.closeDialogRef.value = false
      }
    } catch (err: any) {
      formError.value = err?.message || 'Failed to submit form.'
    }
  }

  return {
    form,
    formError,
    formSuccess,
    submitForm,
  }
}
