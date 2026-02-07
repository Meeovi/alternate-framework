import { normalizeOrder } from './Order.type';
import type { Order as DomainOrder } from '../types/domain';

// Map credit memo (refund) shapes into a predictable structure. Keep a
// permissive fallback to `normalizeOrder` for unfamiliar shapes.
export function normalizeCreditMemo(raw: any): DomainOrder {
  if (!raw) return raw;

  const id = raw?.id ?? raw?.creditmemo_id ?? raw?.increment_id ?? '';
  const number = raw?.increment_id ?? raw?.number ?? raw?.creditmemo_number ?? '';
  const created_at = raw?.created_at ?? raw?.creditmemo_date ?? raw?.date;
  const status = raw?.status ?? raw?.state ?? 'refunded';

  const items = Array.isArray(raw?.items)
    ? raw.items.map((it: any) => ({
        id: String(it?.id ?? it?.item_id ?? ''),
        sku: it?.sku ?? it?.product_sku ?? it?.product?.sku,
        quantity: it?.quantity_refunded ?? it?.qty ?? it?.qty_refunded ?? 0,
        price: it?.price ?? it?.row_subtotal ?? undefined,
        product: it?.product ? {
          id: String(it.product?.id ?? it.product?.sku ?? ''),
          sku: it.product?.sku,
          title: it.product?.name ?? it.product?.title,
        } : undefined,
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

export const normalizeCreditMemos = (raw: any): DomainOrder[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(normalizeCreditMemo);
  if (Array.isArray(raw.items)) return raw.items.map(normalizeCreditMemo);
  return [];
};
