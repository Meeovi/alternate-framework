export function normalizeText(value: unknown) {
  return String(value || '').trim()
}

export function getPrice(item: Record<string, any>) {
  const raw = item?.price ?? item?.amount ?? item?.final_price
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export function getTitle(item: Record<string, any>): string {
  return normalizeText(item?.title ?? item?.name ?? item?.label ?? '')
}

export function getDescription(item: Record<string, any>): string {
  return normalizeText(item?.description ?? item?.desc ?? item?.body ?? item?.summary ?? '')
}

export function getLink(item: Record<string, any>): string | null {
  return item?.url ?? item?.link ?? item?.permalink ?? item?.slug ?? null
}

export function formatPrice(price: number | null): string {
  if (price === null) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price)
}

export function matchesPriceBand(price: number | null, bandId: string): boolean {
  if (!bandId || price === null) return true

  const bands: Record<string, { min: number; max: number }> = {
    '0-25': { min: 0, max: 25 },
    '25-50': { min: 25, max: 50 },
    '50-100': { min: 50, max: 100 },
    '100+': { min: 100, max: Infinity }
  }

  const band = bands[bandId]
  if (!band) return true

  if (band.max === Infinity) return price >= band.min
  return price >= band.min && price < band.max
}

export function deriveOptionsFromItems(items: any[], field: string): Array<{ value: string; count: number }> {
  const counts: Record<string, number> = {}

  for (const item of items) {
    const value = normalizeText(item?.[field])
    if (value) {
      counts[value] = (counts[value] || 0) + 1
    }
  }

  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
}
