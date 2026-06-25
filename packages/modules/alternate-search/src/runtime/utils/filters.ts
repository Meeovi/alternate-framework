export function normalizeText(value: unknown) {
  return String(value || '').trim()
}

export function getPrice(item: Record<string, any>) {
  const raw = item?.price ?? item?.amount ?? item?.final_price
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}
