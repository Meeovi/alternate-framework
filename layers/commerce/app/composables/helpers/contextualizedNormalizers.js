export function toContextualizedNormalizers(normalizers, getContext) {
    return Object.keys(normalizers).reduce((acc, key) => {
        acc[key] = (input) => normalizers[key](getContext(), input);
        return { ...acc };
    }, {});
}
