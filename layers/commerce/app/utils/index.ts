import { NormalizerRegistry, CommerceNormalizer } from './normalizer';

// Keep imports loose because host `@meeovi/commerce` implementations may vary
import * as CommercePkg from '#imports';
const CommerceAny: any = CommercePkg as any;

export type Provider = string;

export interface CommerceLayerConfig {
  provider: Provider;
  providerConfig?: Record<string, any>;
  normalizer?: CommerceNormalizer;
  registry?: NormalizerRegistry;
}

export function createCommerceLayer(config: CommerceLayerConfig) {
  const registry = config.registry ?? new NormalizerRegistry();
  const normalizer = config.normalizer ?? registry.get(config.provider);

  if (!normalizer) {
    throw new Error('No normalizer found for provider: ' + config.provider);
  }

  // Create or obtain a client from `@meeovi/commerce` in a resilient way
  const client = ((): any => {
    try {
      if (typeof CommerceAny.createClient === 'function') {
        return CommerceAny.createClient(config.provider, config.providerConfig);
      }
      if (typeof CommerceAny.init === 'function') {
        return CommerceAny.init(config.providerConfig);
      }
      return CommerceAny;
    } catch (e) {
      // In production, surface useful message while avoiding leaking secrets
      throw new Error('Failed to initialize commerce client for provider: ' + config.provider);
    }
  })();

  async function getProduct(id: string) {
    const raw = await (client.getProduct?.(id) ?? client.fetchProduct?.(id) ?? client.product?.(id));
    return normalizer!.normalizeProduct(raw);
  }

  return {
    client,
    getProduct,
    registry,
    normalizer,
  } as const;
}

export default createCommerceLayer;
