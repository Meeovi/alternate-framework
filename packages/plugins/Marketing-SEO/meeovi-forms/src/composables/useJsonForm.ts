import { reactive, ref } from 'vue'
import { mapSchemaDefaults } from '../utils/mapper.js'
import { useFormValidation } from './useFormValidation.js'

export interface UseJsonFormOptions {
  schema: Record<string, any>
  uiSchema?: Record<string, any>
  initialValue?: Record<string, any>
}

export function useJsonForm(options: UseJsonFormOptions) {
  const base = mapSchemaDefaults(options.schema)
  const model = reactive({ ...base, ...(options.initialValue || {}) })
  const submitting = ref(false)
  const { result, issuesByPath, validate } = useFormValidation(options.schema, model)

  const setValue = (key: string, value: unknown) => {
    ;(model as any)[key] = value
  }

  const reset = () => {
    const next = { ...base, ...(options.initialValue || {}) }
    for (const key of Object.keys(model)) {
      delete (model as any)[key]
    }
    for (const [key, value] of Object.entries(next)) {
      ;(model as any)[key] = value
    }
  }

  const submit = async (onSubmit?: (value: Record<string, any>) => Promise<void> | void) => {
    const current = validate()
    if (!current.valid) {
      return current
    }

    submitting.value = true
    try {
      if (onSubmit) {
        await onSubmit({ ...model })
      }
      return current
    } finally {
      submitting.value = false
    }
  }

  return {
    model,
    submitting,
    validation: result,
    issuesByPath,
    setValue,
    reset,
    submit,
    validate,
    uiSchema: options.uiSchema || {},
    schema: options.schema,
  }
}
