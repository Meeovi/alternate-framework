export const Filters = {
  term(field: string, value: string) {
    return { type: "term", field, value };
  },

  range(field: string, min?: number, max?: number) {
    return { type: "range", field, min, max };
  },

  boolean(field: string, value: boolean) {
    return { type: "boolean", field, value };
  },
};
