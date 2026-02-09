import { Subscription as DomainSubscription } from '../domain';

export interface SubscriptionFragment {
  id: string;
  product_id?: string;
  status?: string;
}

export function normalizeSubscription(raw: any): DomainSubscription {
  if (!raw) return raw;
  return {
    id: String(raw?.id ?? raw?.subscription_id ?? raw?.uid ?? ''),
    productId: raw?.product_id ?? raw?.product?.id ?? raw?.product_sku,
    status: raw?.status ?? raw?.state,
    schedule: raw?.schedule ?? raw?.delivery_schedule,
    raw,
  } as DomainSubscription;
}

export function normalizeSubscriptions(raw: any): DomainSubscription[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(normalizeSubscription);
  if (Array.isArray(raw?.items)) return raw.items.map(normalizeSubscription);
  return [];
}
