import type { BuiltSearchQuery } from "../core/QueryBuilder";
import type { MeeoviSearchItem } from "./types";

export function createMockSearchAdapter(items: MeeoviSearchItem[] = []) {
  const cfg = { provider: "mock" };

  return {
    id: "search:mock",
    type: "search",
    config: cfg,

    async search(query: BuiltSearchQuery | Record<string, unknown>) {
      const term = String((query as any)?.term ?? (query as any)?.params?.q ?? "");
      const filtered = items.filter((item) => item.title?.toLowerCase().includes(term.toLowerCase()));

      return {
        items: filtered,
        total: filtered.length,
        page: 1,
        pageSize: filtered.length,
      };
    },
  };
}
