export function getAssetURL(id: string | undefined | unknown): string | null {
  if (!id) return null
  const filename =
    typeof id === 'object'
      ? (id as any)?.filename_download || (id as any)?.filename || (id as any)?.id
      : String(id)
  if (!filename) return null
  return `${import.meta.env.DIRECTUS_URL}/assets/${filename}`
}

export function hasAsset(id: string | undefined | unknown): boolean {
  return getAssetURL(id) !== null
}
