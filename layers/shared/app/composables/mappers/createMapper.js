export function createMapper(name, fn) {
    return {
        name,
        map: fn
    };
}
