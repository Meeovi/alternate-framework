import { PaymentIntent as DomainPaymentIntent } from '../domain';

export interface PaymentFragment {
  id: string;
  status?: string;
  amount?: number;
  currency?: string;
  method?: string;
}

export function normalizePayment(raw: any): DomainPaymentIntent {
  if (!raw) return raw;
  return {
    id: String(raw?.id ?? raw?.payment_id ?? raw?.uid ?? ''),
    status: raw?.status ?? raw?.state,
    amount: raw?.amount ?? raw?.value ?? raw?.total ?? raw?.amount_paid,
    currency: raw?.currency ?? raw?.currency_code,
    method: raw?.method ?? raw?.payment_method ?? raw?.method_type,
    raw,
  } as DomainPaymentIntent;
}

export function normalizePayments(raw: any): DomainPaymentIntent[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(normalizePayment);
  if (Array.isArray(raw?.items)) return raw.items.map(normalizePayment);
  return [];
}
