import type { OpenSearchResult } from "../types";

export const normalizeOpenSearchResult = (result: any): OpenSearchResult => ({
  items: (result?.items ?? []).map((item: any) => ({
    id: String(item?.id ?? ""),
    title: item?.title ?? item?.name,
    snippet: item?.snippet ?? item?.description,
    score: typeof item?._score === "number" ? item._score : undefined
  })),
  total: Number(result?.total ?? 0),
  page: Number(result?.page ?? 1),
  pageSize: Number(result?.pageSize ?? 10)
});