import { normalizeText } from './filters'

export function facetToOptions(raw: any, field: string) {
  if (!raw) return []

  const objectFacet = raw?.[field]
  if (objectFacet && typeof objectFacet === 'object' && !Array.isArray(objectFacet)) {
    return Object.entries(objectFacet)
      .map(([value, count]) => ({ value, count: Number(count || 0) }))
      .filter(e => e.value && e.count > 0)
      .sort((a, b) => b.count - a.count)
  }

  const arrayFacet = Array.isArray(raw) ? raw.find(e => e?.field === field) : null
  const buckets = arrayFacet?.buckets
  if (Array.isArray(buckets)) {
    return buckets
      .map(entry => ({
        value: normalizeText(entry?.value),
        count: Number(entry?.count || 0)
      }))
      .filter(e => e.value && e.count > 0)
      .sort((a, b) => b.count - a.count)
  }

  return []
}
