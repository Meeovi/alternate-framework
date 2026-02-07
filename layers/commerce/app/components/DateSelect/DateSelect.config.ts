export const DateFieldAttr = {
  TYPE: 'data-type',
  NAME: 'data-name',
} as const

export type DateFieldAttrType = typeof DateFieldAttr

export enum HourFormat {
  H12 = 12,
  H24 = 24,
}

export const DEFAULT_DATE_ATTRS = { format: 'YYYY-MM-DD' }

export default DEFAULT_DATE_ATTRS
