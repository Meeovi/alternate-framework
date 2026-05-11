export const maxAccountFieldCount = 4

export function convertMetadata(metadata: Array<{ name?: string; value?: string }> | null | undefined) {
  if (!metadata)
    return []

  return metadata
    .filter(entry => entry && (entry.name || entry.value))
    .slice(0, maxAccountFieldCount)
    .map(entry => ({
      name: String(entry.name || '').trim(),
      value: String(entry.value || '').trim(),
    }))
}
