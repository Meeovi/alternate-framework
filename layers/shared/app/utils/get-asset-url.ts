export function getAssetURL(id: string | undefined | unknown): string | null {
  if (!id) return null
  const filename =
    typeof id === 'object'
      ? (id as any)?.filename_download || (id as any)?.filename || (id as any)?.id
      : String(id)
  if (!filename) return null
  const directusUrl = useRuntimeConfig().public.directusUrl
  if (!directusUrl) return null
  return `${directusUrl}/assets/${filename}`
}

export function hasAsset(id: string | undefined | unknown): boolean {
  return getAssetURL(id) !== null
}
