export type OpenSearchQueryInput = {
  query?: string;
  page?: number;
  pageSize?: number;
};

export type OpenSearchItem = {
  id: string;
  title?: string;
  snippet?: string;
  score?: number;
};

export type OpenSearchResult = {
  items: OpenSearchItem[];
  total: number;
  page: number;
  pageSize: number;
};

export interface OpenSearchGatewayAdapterContract {
  search(input: OpenSearchQueryInput): Promise<OpenSearchResult>;
}