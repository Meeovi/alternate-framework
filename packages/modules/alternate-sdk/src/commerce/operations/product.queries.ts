import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { gql } from '@mframework/adapter-gateway/client'

export type GetProductQueryResponse = {
  product: {
    id: string
    name: string
    title: string
    slug: string
    description: string
    price?: number
    image?: string
    images: string[]
  } | null
}

export type GetProductQueryVariables = {
  id: string
}

export type GetProductsQueryResponse = {
  products: Array<{
    id: string
    name: string
    title: string
    slug: string
    description: string
    price?: number
    image?: string
    images: string[]
  }>
}

export type GetProductsQueryVariables = {
  filter?: {
    search?: string
    categoryId?: string
    pageSize?: number
    currentPage?: number
  }
}

export type SearchProductsQueryResponse = {
  search: Array<{
    id: string
    name: string
    title: string
    slug: string
    description: string
    price?: number
    image?: string
  }>
}

export type SearchProductsQueryVariables = {
  query: string
  limit?: number
  offset?: number
}

export type GetCategoriesQueryResponse = {
  categories: Array<{
    id: string
    name: string
    slug: string
    description: string
  }>
}

export type GetCategoriesQueryVariables = Record<string, never>

export type GetCategoryQueryResponse = {
  category: {
    id: string
    name: string
    slug: string
    description: string
  } | null
}

export type GetCategoryQueryVariables = {
  id: string
}

export type GetBrandsQueryResponse = {
  brands: Array<{
    id: string
    name: string
    slug: string
    description: string
  }>
}

export type GetBrandsQueryVariables = Record<string, never>

export type GetBrandQueryResponse = {
  brand: {
    id: string
    name: string
    slug: string
    description: string
  } | null
}

export type GetBrandQueryVariables = {
  id: string
}

export type GetPriceQueryResponse = {
  price: {
    regular: { value: number; currencyCode: string }
    current?: { value: number; currencyCode: string }
  } | null
}

export type GetPriceQueryVariables = {
  productId: string
}

export type GetCatalogPriceRulesQueryResponse = {
  priceRules: Array<{
    id: string
    name: string
    conditions: Record<string, unknown>
    actions: Record<string, unknown>
  }>
}

export type GetCatalogPriceRulesQueryVariables = Record<string, never>

export type GetSuggestionsQueryResponse = {
  suggestions: Array<{
    id: string
    name: string
    price?: number
  }>
}

export type GetSuggestionsQueryVariables = {
  query: string
  limit?: number
}

export const GetProductQuery: TypedDocumentNode<GetProductQueryResponse, GetProductQueryVariables> = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      title
      slug
      description
      price
      image
      images
    }
  }
`

export const GetProductsQuery: TypedDocumentNode<GetProductsQueryResponse, GetProductsQueryVariables> = gql`
  query GetProducts($filter: ProductFilter) {
    products(filter: $filter) {
      id
      name
      title
      slug
      description
      price
      image
      images
    }
  }
`

export const SearchProductsQuery: TypedDocumentNode<SearchProductsQueryResponse, SearchProductsQueryVariables> = gql`
  query SearchProducts($query: String!, $limit: Int, $offset: Int) {
    search(query: $query, limit: $limit, offset: $offset) {
      id
      name
      title
      slug
      description
      price
      image
    }
  }
`

export const GetCategoriesQuery: TypedDocumentNode<GetCategoriesQueryResponse, GetCategoriesQueryVariables> = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
    }
  }
`

export const GetCategoryQuery: TypedDocumentNode<GetCategoryQueryResponse, GetCategoryQueryVariables> = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      slug
      description
    }
  }
`

export const GetBrandsQuery: TypedDocumentNode<GetBrandsQueryResponse, GetBrandsQueryVariables> = gql`
  query GetBrands {
    brands {
      id
      name
      slug
      description
    }
  }
`

export const GetBrandQuery: TypedDocumentNode<GetBrandQueryResponse, GetBrandQueryVariables> = gql`
  query GetBrand($id: ID!) {
    brand(id: $id) {
      id
      name
      slug
      description
    }
  }
`

export const GetPriceQuery: TypedDocumentNode<GetPriceQueryResponse, GetPriceQueryVariables> = gql`
  query GetPrice($productId: ID!) {
    price(productId: $productId) {
      regular { value currencyCode }
      current { value currencyCode }
    }
  }
`

export const GetCatalogPriceRulesQuery: TypedDocumentNode<GetCatalogPriceRulesQueryResponse, GetCatalogPriceRulesQueryVariables> = gql`
  query GetCatalogPriceRules {
    priceRules {
      id
      name
      conditions
      actions
    }
  }
`

export const GetSuggestionsQuery: TypedDocumentNode<GetSuggestionsQueryResponse, GetSuggestionsQueryVariables> = gql`
  query GetSuggestions($query: String!, $limit: Int) {
    suggestions(query: $query, limit: $limit) {
      id
      name
      price
    }
  }
`