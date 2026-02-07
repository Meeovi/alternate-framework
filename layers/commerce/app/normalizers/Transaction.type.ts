import { PaymentIntent as DomainPaymentIntent } from '../types/domain';

export function normalizeTransaction(raw: any): DomainPaymentIntent {
  if (!raw) return raw;
  return {
    id: String(raw?.id ?? raw?.transaction_id ?? raw?.uid ?? ''),
    status: raw?.status ?? raw?.state,
    amount: raw?.amount ?? raw?.total ?? raw?.value,
    currency: raw?.currency ?? raw?.currency_code ?? raw?.currencyCode,
    method: raw?.method ?? raw?.payment_method ?? raw?.method_type,
    raw,
  } as DomainPaymentIntent;
}

export function normalizeTransactions(raw: any): DomainPaymentIntent[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(normalizeTransaction);
  if (Array.isArray(raw.items)) return raw.items.map(normalizeTransaction);
  return [];
}
