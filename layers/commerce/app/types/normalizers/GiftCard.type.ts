import { GiftCard as DomainGiftCard } from '../domain';

export interface GiftCardFragment {
  code: string;
  balance?: number;
  currency?: string;
}

export function normalizeGiftCard(raw: any): DomainGiftCard {
  if (!raw) return raw;
  return {
    code: raw?.code ?? raw?.giftcard_code ?? '',
    balance: raw?.balance ?? raw?.amount ?? raw?.balance_amount,
    currency: raw?.currency ?? raw?.currency_code,
    raw,
  } as DomainGiftCard;
}

export function normalizeGiftCards(raw: any): DomainGiftCard[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(normalizeGiftCard);
  if (Array.isArray(raw?.items)) return raw.items.map(normalizeGiftCard);
  return [];
}
