export const Filters = {
    term(field, value) {
        return { type: 'term', field, value };
    },
    range(field, min, max) {
        return { type: 'range', field, min, max };
    },
    boolean(field, value) {
        return { type: 'boolean', field, value };
    }
};
