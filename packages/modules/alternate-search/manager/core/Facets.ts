export const Facets = {
  terms(field: string) {
    return { type: "terms", field };
  },

  range(field: string, ranges: Array<{ from?: number; to?: number }>) {
    return { type: "range", field, ranges };
  },
};
