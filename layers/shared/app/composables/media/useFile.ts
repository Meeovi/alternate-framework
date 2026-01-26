import type { FilePlugin } from '../../types/index.d'

export function useFile() {
  const { $file } = useNuxtApp()
  return $file as FilePlugin
}