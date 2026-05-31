import { ref } from 'vue'
import { useJsonForm } from '../../../../../packages/modules/ui-forms/src/composables/useJsonForm'

export function useContentForm(options?: any) {
  const formLogic = useJsonForm({
    schema: { type: 'object', properties: {} },
    initialValue: options?.initialValues || {},
  })
  const form = ref(formLogic.model)
  const isSubmitting = ref(false)
  const errors = ref({})

  const submit = async (callback?: (values: any) => Promise<void>) => {
    isSubmitting.value = true
    try {
      const validation = formLogic.validate()
      if (!validation.valid) {
        errors.value = validation.issues
        return
      }

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
      formLogic.reset()
      form.value = formLogic.model
    }
  }
}

export default useContentForm