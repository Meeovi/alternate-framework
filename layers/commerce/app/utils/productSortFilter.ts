import type { FilterDef, SortFilterConfig } from '#shared/app/composables/useSortFilter'
import { byDate, byNumber, byText, choicesFrom } from '#shared/app/composables/useSortFilter'
import { productSeller } from './productSeller'

/**
 * Sorts and filters for a grid of products (departments, categories, lists,
 * hashtags), for useSortFilter + <SortFilterBar>. `items` gives the loaded
 * products, for the seller choices; `extra` adds a page's own filters
 * (e.g. its categories).
 */

const price = (p: any) => {
  const n = Number(p?.price ?? p?.price_range?.minimum_price?.final_price?.value)
  return Number.isFinite(n) ? n : null
}
const created = (p: any) => p?.created_at || p?.date_created || p?.updated_at
const sellerName = (p: any) => productSeller(p)?.name || ''

export const PRICE_BANDS = [
  { value: 'free', title: 'Free', test: (n: number) => n === 0 },
  { value: 'under-20', title: 'Under $20', test: (n: number) => n > 0 && n < 20 },
  { value: '20-50', title: '$20 to $50', test: (n: number) => n >= 20 && n <= 50 },
  { value: 'over-50', title: 'Over $50', test: (n: number) => n > 50 },
]

export function productSortFilter(
  id: string,
  items: () => any[] | null | undefined,
  extra: FilterDef<any>[] = [],
): SortFilterConfig<any> {
  return {
    id,
    sorts: [
      { value: 'newest', title: 'Newest', compare: byDate(created) },
      { value: 'oldest', title: 'Oldest', compare: byDate(created, false) },
      { value: 'price-asc', title: 'Price: low to high', compare: byNumber(price) },
      { value: 'price-desc', title: 'Price: high to low', compare: byNumber(price, true) },
      { value: 'name', title: 'Name: A to Z', compare: byText((p: any) => p?.name) },
      { value: 'name-desc', title: 'Name: Z to A', compare: byText((p: any) => p?.name, true) },
      { value: 'rating', title: 'Top rated', compare: byNumber((p: any) => p?.rating, true) },
    ],
    search: (p: any) => [p?.name, sellerName(p), p?.short_description, p?.sku, p?.mageos_sku].join(' '),
    filters: [
      {
        key: 'price',
        title: 'Price',
        // Only the bands some product falls in.
        options: () => PRICE_BANDS.filter((band) => (items() ?? []).some((p) => {
          const n = price(p)
          return n !== null && band.test(n)
        })).map(({ value, title }) => ({ value, title })),
        multiple: true,
        match: (p: any, value: string) => {
          const n = price(p)
          const band = PRICE_BANDS.find((b) => b.value === value)
          return n !== null && !!band?.test(n)
        },
      },
      ...extra,
      {
        key: 'seller',
        title: 'Seller',
        options: () => choicesFrom(items(), sellerName),
        multiple: true,
        match: (p: any, value: string) => sellerName(p).toLowerCase() === value.toLowerCase(),
      },
    ],
  }
}
