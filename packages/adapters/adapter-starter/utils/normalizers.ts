import type { StarterSearchResult } from "../types";

export const normalizeStarterSearchResult = (result: any): StarterSearchResult => ({
  items: (result?.items ?? []).map((item: any) => ({
    id: String(item?.id ?? ""),
    title: item?.title ?? item?.name,
    snippet: item?.snippet ?? item?.description
  })),
  total: Number(result?.total ?? 0)
});