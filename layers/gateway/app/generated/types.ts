export type Maybe<T> = T | null;

export type AuthUser = {
  id: string;
  email: string;
  roles: string[];
};

export type CommerceProduct = {
  id: string;
  title: string;
  price: number;
  currency: string;
};

export type SearchItem = {
  id: string;
  title: string;
  snippet?: string;
  score: number;
};