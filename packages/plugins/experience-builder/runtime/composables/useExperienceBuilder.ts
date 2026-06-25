import { computed, ref } from 'vue'
import { useNuxtApp, useRuntimeConfig, useFetch } from 'nuxt/app'
import type { Editor } from 'grapesjs'
import { getAllComponents } from '../registry'

export interface SpacesPageContent {
  id?: string
  spaceId: string
  slug: string
  title: string
  data: any // GrapesJS JSON
  published: boolean
  updatedAt?: string
  createdAt?: string
}

const editorRef = ref<Editor | null>(null)

export function useSpacesBuilder () {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()
  const apiBase = computed(() => config?.public?.experienceBuilder?.apiBase as string)

  const components = computed(() => getAllComponents())

  function setEditor (editor: Editor) {
    editorRef.value = editor
  }

  function getEditor () {
    return editorRef.value
  }

  async function loadPage (spaceId: string, slug: string) {
    const { data, error } = await useFetch<SpacesPageContent>(`${apiBase.value}/${spaceId}/${slug}`)
    if (error.value) throw error.value
    return data.value
  }

  async function savePage (payload: SpacesPageContent) {
    const { data, error } = await useFetch<SpacesPageContent>(`${apiBase.value}/${payload.spaceId}/${payload.slug}`, {
      method: 'POST',
      body: payload
    })
    if (error.value) throw error.value
    return data.value
  }

  async function deletePage (spaceId: string, slug: string) {
    const { error } = await useFetch(`${apiBase.value}/${spaceId}/${slug}`, {
      method: 'DELETE'
    })
    if (error.value) throw error.value
  }

  return {
    components,
    setEditor,
    getEditor,
    loadPage,
    savePage,
    deletePage
  }
}
