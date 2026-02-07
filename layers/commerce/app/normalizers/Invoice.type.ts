import { normalizeOrder } from './Order.type';
import type { Order as DomainOrder } from '../types/domain';

// Provide a richer invoice normalizer that maps common invoice fields into
// a predictable shape consumers expect. We still fall back to `normalizeOrder`
// for unknown shapes to remain permissive.
export function normalizeInvoice(raw: any): DomainOrder {
  if (!raw) return raw;

  // Base fields: id/number/date/status/raw
  const id = raw?.id ?? raw?.invoice_id ?? raw?.increment_id ?? '';
  const number = raw?.increment_id ?? raw?.number ?? raw?.invoice_number ?? '';
  const created_at = raw?.created_at ?? raw?.invoice_date ?? raw?.date;
  const status = raw?.status ?? raw?.state;

  // Normalize items: try common shapes (invoice.items, items, lines)
  const items = Array.isArray(raw?.items)
    ? raw.items.map((it: any) => ({
        id: String(it?.id ?? it?.item_id ?? it?.uid ?? ''),
        sku: it?.sku ?? it?.product_sku ?? it?.product?.sku,
        quantity: it?.quantity ?? it?.qty ?? it?.quantity_invoiced ?? 0,
        price: it?.price ?? it?.price_incl_tax ?? it?.row_subtotal ?? undefined,
        product: it?.product ? {
          id: String(it.product?.id ?? it.product?.sku ?? ''),
          sku: it.product?.sku,
          title: it.product?.name ?? it.product?.title,
          price: (it.product?.price && (it.product.price.final_price?.value ?? it.product.price)) ?? undefined,
          images: Array.isArray(it.product?.media_gallery_entries)
            ? it.product.media_gallery_entries.map((m: any) => ({ url: m.file ?? m.url }))
            : []
        } : undefined,
        raw: it,
      }))
    : [];

  // Total mapping: prefer structured totals, fall back to simple grand_total
  const total = raw?.total ?? raw?.grand_total ?? raw?.total_amount ?? raw?.amount;

  // If the shape is unusual, fall back to order normalizer for maximum compatibility
  if (!id && !number && !Array.isArray(raw?.items)) return normalizeOrder(raw);

  return {
    id: String(id),
    number,
    created_at,
    status,
    items,
    total,
    raw,
  };
}

export const normalizeInvoices = (raw: any): DomainOrder[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(normalizeInvoice);
  if (Array.isArray(raw.items)) return raw.items.map(normalizeInvoice);
  return [];
};
