import { useNuxtApp } from 'nuxt/app'
import useDirectusRequest from '../useDirectusRequest'

export function useFile() {
  const nuxt = useNuxtApp() as any
  const adapter = nuxt?.$adapter
  if (adapter && adapter.file) return adapter.file
  if (nuxt?.$file) return nuxt.$file

  // Fallback: expose minimal upload helper using adapter-aware uploadFiles
  const { uploadFiles } = useDirectusRequest()
  return {
    upload: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return await uploadFiles(form)
    }
  }
}