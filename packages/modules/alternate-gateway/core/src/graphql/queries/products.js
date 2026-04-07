import { gql } from 'graphql-tag';
export const GET_PRODUCT = gql `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      description
      price
      images
    }
  }
`;
export const LIST_PRODUCTS = gql `
  query ListProducts {
    products {
      id
      title
      price
      images
    }
  }
`;
