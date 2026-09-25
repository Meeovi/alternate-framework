import { ref } from 'vue'
import { useJsonForm } from './useJsonForm'
import type { ApiFormConfig } from '../types'
import { DEFAULT_UPLOAD_ENDPOINT, uploadFileValues } from '../utils/uploadFiles'

export interface UseApiFormOptions {
  apiName: string
  initialValue?: Record<string, any>
}

export function useApiForm (options: UseApiFormOptions) {
  const nuxtApp = useNuxtApp()
  const meeoviForms = nuxtApp.$meeoviForms as
    | { getApi: (name: string) => ApiFormConfig | null }
    | undefined

  const apiConfig = ref<ApiFormConfig | null>(
    meeoviForms?.getApi(options.apiName) || null
  )

  const form = useJsonForm({
    schema: apiConfig.value?.schema || { type: 'object', properties: {} },
    uiSchema: apiConfig.value?.uiSchema || {},
    initialValue: {
      ...(apiConfig.value?.defaults || {}),
      ...(options.initialValue || {})
    }
  })

  const submitting = ref(false)

  async function submit (): Promise<any> {
    submitting.value = true
    try {
      const endpoint = apiConfig.value?.submitEndpoint
      if (!endpoint) {
        return { data: { ...form.model } }
      }

      const base = (nuxtApp.$config.public as any)?.meeoviForms?.apiBase || ''
      const url = `${base}${endpoint}`.replace(/\/+/g, '/')

      const uploadEndpoint = (nuxtApp.$config.public as any)?.meeoviForms?.uploadEndpoint || DEFAULT_UPLOAD_ENDPOINT
      const result = await $fetch(url, {
        method: apiConfig.value?.submitMethod || 'POST',
        body: await uploadFileValues({ ...form.model }, uploadEndpoint, options.apiName)
      })

      form.reset()
      return result
    } finally {
      submitting.value = false
    }
  }

  return {
    apiConfig,
    form,
    submitting,
    submit,
    reset: form.reset,
    validate: form.validate
  }
}
