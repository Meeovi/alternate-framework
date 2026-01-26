import * as CommercePkg from '#imports';
import { sdk } from '@meeovi/sdk';

const CommerceAny: any = CommercePkg as any;

/**
 * Returns a commerce client. Prefer `@meeovi/commerce` client creation APIs
 * when available, otherwise fall back to `sdk.commerce`.
 */
export function getCommerceClient(provider?: string, providerConfig?: any) {
  try {
    if (typeof CommerceAny.createClient === 'function') {
      return CommerceAny.createClient(provider, providerConfig);
    }
    if (typeof CommerceAny.init === 'function') {
      return CommerceAny.init(providerConfig);
    }
  } catch (e) {
    // swallow and fallback to sdk
  }

  // fallback: return the SDK's commerce helper (already used in many composables)
  return sdk.commerce;
}

export default getCommerceClient;
