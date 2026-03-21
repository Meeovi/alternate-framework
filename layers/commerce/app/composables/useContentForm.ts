import { ref } from 'vue'

export function useContentForm(options?: any) {
  const form = ref(options?.initialValues || {})
  const isSubmitting = ref(false)
  const errors = ref({})

  const submit = async (callback?: (values: any) => Promise<void>) => {
    isSubmitting.value = true
    try {
      if (callback) {
        await callback(form.value)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    form,
    isSubmitting,
    errors,
    submit,
    reset: () => {
      form.value = options?.initialValues || {}
    }
  }
}

export default useContentForm