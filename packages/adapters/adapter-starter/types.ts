export type StarterSearchItem = {
  id: string;
  title?: string;
  snippet?: string;
};

export type StarterSearchResult = {
  items: StarterSearchItem[];
  total: number;
};

export interface StarterGatewayAdapterContract {
  health(): string;
  search(query: string): Promise<StarterSearchResult>;
}