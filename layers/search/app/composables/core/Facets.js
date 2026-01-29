export const Facets = {
    terms(field) {
        return { type: 'terms', field };
    },
    range(field, ranges) {
        return { type: 'range', field, ranges };
    }
};
