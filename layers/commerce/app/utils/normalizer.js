export class NormalizerRegistry {
    registry = new Map();
    register(name, normalizer) {
        this.registry.set(name, normalizer);
    }
    get(name) {
        return this.registry.get(name);
    }
    list() {
        return Array.from(this.registry.keys());
    }
}
export default NormalizerRegistry;
