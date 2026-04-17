import { ref } from '#imports'

export type DataFormOptions = {
  clearOnSuccess?: boolean
  closeDialogRef?: { value: boolean }
}

export function useDataForm(
  collection: string,
  fieldsRef: { value?: any[] } | any[],
  options: DataFormOptions = {},
) {
  const form = ref<Record<string, any>>({})
  const formError = ref<string>('')
  const formSuccess = ref(false)

  const reset = () => {
    form.value = {}
    formError.value = ''
    formSuccess.value = false
  }

  const submitForm = async () => {
    formError.value = ''
    formSuccess.value = false
    try {
      const nuxtApp = useNuxtApp() as any
      const writer = nuxtApp?.$dataWriter
      if (writer && typeof writer.createItem === 'function') {
        await writer.createItem(collection, form.value)
      }
      formSuccess.value = true
      if (options.clearOnSuccess) {
        form.value = {}
      }
      if (options.closeDialogRef && 'value' in options.closeDialogRef) {
        options.closeDialogRef.value = false
      }
    } catch (err: any) {
      formError.value = err?.message || 'Unable to submit form'
    }
  }

  return {
    form,
    formError,
    formSuccess,
    submitForm,
    reset,
  }
}

export default useDataForm
