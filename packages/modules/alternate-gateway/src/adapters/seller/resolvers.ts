import { readFileSync } from "node:fs";
import { join } from "node:path";

const typeDefs = readFileSync(join(process.cwd(), "app", "adapters", "seller", "schema.graphql"), "utf-8");

export const sellerAdapter = {
  name: "seller",
  typeDefs,
  resolvers: {
    Query: {
      sellerProducts: async () => [
        {
          id: "seller-product-1",
          title: "Starter Seller Product",
          inventory: 100
        }
      ],
      sellerOrders: async () => [
        {
          id: "seller-order-1",
          total: 42.0,
          status: "PAID"
        }
      ],
      sellerAnalytics: async () => ({
        grossRevenue: 4200,
        netRevenue: 3150,
        orderCount: 100
      })
    }
  }
};