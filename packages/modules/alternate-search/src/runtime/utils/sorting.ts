import { getPrice, getTitle } from './filters'

export function sortItems(list: any[], sort: string) {
  const copy = [...list]
  if (sort === 'price-asc') {
    return copy.sort((a, b) => (getPrice(a) ?? Infinity) - (getPrice(b) ?? Infinity))
  }
  if (sort === 'price-desc') {
    return copy.sort((a, b) => (getPrice(b) ?? 0) - (getPrice(a) ?? 0))
  }
  if (sort === 'title-asc') {
    return copy.sort((a, b) => getTitle(a).localeCompare(getTitle(b)))
  }
  return copy
}
