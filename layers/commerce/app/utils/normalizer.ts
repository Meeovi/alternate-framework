export interface CommerceNormalizer {
  normalizeProduct(data: any): any;
  normalizeCategory?(data: any): any;
  normalizeCart?(data: any): any;
}

export class NormalizerRegistry {
  private registry = new Map<string, CommerceNormalizer>();

  register(name: string, normalizer: CommerceNormalizer) {
    this.registry.set(name, normalizer);
  }

  get(name: string): CommerceNormalizer | undefined {
    return this.registry.get(name);
  }

  list(): string[] {
    return Array.from(this.registry.keys());
  }
}

export default NormalizerRegistry;
