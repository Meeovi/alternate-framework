import { GraphQLClient } from "graphql-request";

export const magentoClient = new GraphQLClient(
  process.env.MAGENTO_GRAPHQL_URL
    ?? process.env.MAGE_MAGENTO_GRAPHQL_URL
    ?? `${process.env.MAGE_STORE_URL ?? "http://localhost:4102"}/graphql`,
  {
    headers: {
      Authorization: `Bearer ${process.env.MAGENTO_TOKEN ?? process.env.WEBSITE_TOKEN ?? process.env.GQL_KEY ?? ""}`
    }
  }
);