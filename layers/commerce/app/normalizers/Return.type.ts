import { normalizeOrder } from './Order.type';
import type { Order as DomainOrder } from '../types/domain';

// Normalize return objects (customer returns / RMA) into a stable shape.
// Returns frequently contain returned items and refund-related totals.
export function normalizeReturn(raw: any): DomainOrder {
  if (!raw) return raw;

  const id = raw?.id ?? raw?.return_id ?? raw?.increment_id ?? '';
  const number = raw?.increment_id ?? raw?.number ?? raw?.return_number ?? '';
  const created_at = raw?.created_at ?? raw?.requested_at ?? raw?.date;
  const status = raw?.status ?? raw?.state ?? raw?.return_status;

  const items = Array.isArray(raw?.items)
    ? raw.items.map((it: any) => ({
        id: String(it?.id ?? it?.item_id ?? ''),
        sku: it?.sku ?? it?.product_sku ?? it?.product?.sku,
        quantity: it?.quantity_returned ?? it?.qty ?? it?.qty_returned ?? 0,
        price: it?.price ?? it?.row_subtotal ?? undefined,
        product: it?.product ? {
          id: String(it.product?.id ?? it.product?.sku ?? ''),
          sku: it.product?.sku,
          title: it.product?.name ?? it.product?.title,
        } : undefined,
        reason: it?.reason ?? it?.return_reason,
        raw: it,
      }))
    : [];

  const total = raw?.total ?? raw?.refund_amount ?? raw?.grand_total ?? raw?.amount;

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

export const normalizeReturns = (raw: any): DomainOrder[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(normalizeReturn);
  if (Array.isArray(raw.items)) return raw.items.map(normalizeReturn);
  return [];
};
