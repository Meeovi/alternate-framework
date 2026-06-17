import { reactive, ref, unref, watchEffect, type Ref } from 'vue'
import { useJsonForm } from '../../../../packages/modules/ui-forms/src/composables/useJsonForm'

type ContentFormOptions = {
  clearOnSuccess?: boolean
  closeDialogRef?: Ref<boolean>
}

export function useContentForm(collection: string, fields: any, options: ContentFormOptions = {}) {
  const { $directus, $createItem } = useNuxtApp()

  if (typeof $createItem !== 'function') {
    throw new Error('Gateway content adapter is not available on Nuxt app instance.')
  }

  const formSchema = {
    type: 'object',
    properties: {},
    required: [],
  } as Record<string, any>

  const formLogic = useJsonForm({
    schema: formSchema,
    initialValue: {},
  })

  const form = reactive<Record<string, any>>(formLogic.model as Record<string, any>)
  const formError = ref('')
  const formSuccess = ref('')

  watchEffect(() => {
    const resolvedFields = unref(fields) || []
    const nextProperties: Record<string, any> = {}
    const nextRequired: string[] = []

    for (const field of resolvedFields) {
      if (!field?.field) continue

      const dataType = String(field.type || field.schema?.data_type || '').toLowerCase()
      nextProperties[field.field] = {
        type: ['integer', 'float', 'decimal', 'number'].includes(dataType) ? 'number' : dataType === 'boolean' ? 'boolean' : 'string',
        title: field.meta?.note || field.name || field.field,
      }

      if (field.meta?.required || !field.schema?.is_nullable) {
        if (!nextRequired.includes(field.field)) {
          nextRequired.push(field.field)
        }
      }

      if (!(field.field in form)) {
        form[field.field] = null
      }
    }

    formSchema.properties = nextProperties
    formSchema.required = nextRequired
  })

  const submitForm = async () => {
    formError.value = ''
    formSuccess.value = ''

    try {
      const validation = formLogic.validate()
      if (!validation.valid) {
        formError.value = validation.issues[0]?.message || 'Invalid form values.'
        return
      }

      await $directus.request($createItem(collection, { ...form }))
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

export default useContentForm