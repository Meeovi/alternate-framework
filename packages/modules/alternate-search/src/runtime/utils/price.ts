import { getPrice } from './filters'

export function priceBandsFor(items: any[]) {
  const bands = [
    { id: '0-25', min: 0, max: 25, label: 'Under $25' },
    { id: '25-50', min: 25, max: 50, label: '$25 to $50' },
    { id: '50-100', min: 50, max: 100, label: '$50 to $100' },
    { id: '100+', min: 100, max: Infinity, label: '$100 & above' }
  ]

  return bands
    .map(band => ({
      ...band,
      count: items.filter(item => {
        const price = getPrice(item)
        if (price === null) return false
        if (band.max === Infinity) return price >= band.min
        return price >= band.min && price < band.max
      }).length
    }))
    .filter(band => band.count > 0)
}
