import type { IColumnConfig } from '@svar-ui/vue-grid'
import type { MeeoviTableField } from '../types'

const IDENTIFIER = /(^id$|_id$|^sku$|_sku$|code|ean|upc|isbn|gtin|barcode|zip|postal|phone)/i

function plain(value: unknown) {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDate(value: unknown, withTime: boolean) {
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  return withTime ? date.toLocaleString() : date.toLocaleDateString()
}

function display(value: unknown, field: MeeoviTableField): string {
  if (value == null || value === '') return ''
  if (field.choices) {
    const choice = field.choices.find((c) => String(c.id) === String(value))
    if (choice) return choice.label
  }
  switch (field.type) {
    case 'number': {
      const n = Number(value)
      if (!Number.isFinite(n)) return String(value)
      // Identifiers (SKUs, ids, codes, barcodes) stay as-is — no separators.
      return IDENTIFIER.test(field.field) ? String(value).replace(/\.0+$/, '') : n.toLocaleString()
    }
    case 'boolean': return value ? 'Yes' : 'No'
    case 'date': return formatDate(value, false)
    case 'datetime': return formatDate(value, true)
    case 'json': return Array.isArray(value) ? `${value.length} item${value.length === 1 ? '' : 's'}` : plain(JSON.stringify(value)).slice(0, 120)
    case 'text': return plain(value).slice(0, 200)
    default:
      if (typeof value === 'object') return Array.isArray(value) ? `${value.length} items` : plain(JSON.stringify(value)).slice(0, 120)
      return String(value)
  }
}

/** Directus-derived schema → SVAR Grid columns. `overrides` (matched by id)
 *  are merged on top; `hide` lists columns to start hidden. */
export function schemaToColumns(
  schema: MeeoviTableField[],
  overrides: Partial<IColumnConfig>[] = [],
  hide: string[] = [],
): IColumnConfig[] {
  return schema.map((field) => {
    const base: IColumnConfig = {
      id: field.field,
      header: field.label,
      sort: field.sortable !== false,
      hidden: Boolean(field.hidden) || hide.includes(field.field),
      template: (value: unknown) => display(value, field),
    }
    if (field.field === 'id') base.width = 90
    else if (field.type === 'number' || field.type === 'boolean') base.width = 110
    else if (field.type === 'date') base.width = 130
    else if (field.type === 'datetime') base.width = 180
    else if (field.type === 'uuid') base.width = 150
    else if (field.narrow) base.width = 160
    else base.flexgrow = 1
    if (field.choices) base.options = field.choices
    const extra = overrides.find((o) => o.id === field.field)
    return extra ? { ...base, ...extra } as IColumnConfig : base
  })
}
