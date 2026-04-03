import type { BuiltSearchQuery } from "../core/QueryBuilder";

export type MeeoviSearchItem = {
  id: string;
  title: string;
  description?: string;
  price?: number;
  [key: string]: unknown;
};

export type MeeoviSearchAdapter = {
  id?: string;
  type?: string;
  config?: unknown;
  search(query: BuiltSearchQuery | unknown): Promise<{
    items: MeeoviSearchItem[];
    total: number;
    page?: number;
    pageSize?: number;
  }>;
};
