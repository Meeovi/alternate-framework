export function createNormalizer(fn) {
    return (input) => {
        return fn(input);
    };
}
