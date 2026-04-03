import { readFileSync } from "node:fs";
import { join } from "node:path";

const typeDefs = readFileSync(join(process.cwd(), "app", "adapters", "commerce", "schema.graphql"), "utf-8");

export const commerceAdapter = {
  name: "commerce",
  typeDefs,
  resolvers: {
    Query: {
      commerceGetProduct: async (_: unknown, args: { id: string }) => ({
        id: args.id,
        title: "Sample Product",
        price: 19.99,
        currency: "USD"
      }),
      commerceGetCart: async (_: unknown, args: { id: string }) => ({
        id: args.id,
        items: [
          {
            id: "product-1",
            title: "Sample Product",
            price: 19.99,
            currency: "USD"
          }
        ],
        total: 19.99
      })
    },
    Mutation: {
      commerceCheckout: async (_: unknown, args: { input: { cartId: string } }) => ({
        id: `order-${args.input.cartId}`,
        status: "PLACED",
        total: 19.99
      })
    }
  }
};