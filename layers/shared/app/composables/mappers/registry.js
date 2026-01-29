import { MapperNotFoundError } from './errors';
const registry = new Map();
export function registerMapper(mapper) {
    registry.set(mapper.name, mapper);
}
export function getMapper(name) {
    const mapper = registry.get(name);
    if (!mapper) {
        throw new MapperNotFoundError(name);
    }
    return mapper;
}
export function hasMapper(name) {
    return registry.has(name);
}
export function listMappers() {
    return Array.from(registry.keys());
}
