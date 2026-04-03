import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const typeDefs = readFileSync(
  join(currentDir, "schema.graphql"),
  "utf-8"
);

type CommerceMagentoContext = {
  adapters: {
    commerce: {
      magento: {
        getProduct: (id: string) => Promise<unknown>;
        getProducts: (filter?: unknown) => Promise<unknown[]>;
        getCategories: () => Promise<unknown[]>;
        addToCart: (input: unknown) => Promise<unknown>;
        updateCart: (input: unknown) => Promise<unknown>;
        removeFromCart: (itemId: string) => Promise<unknown>;
      };
    };
  };
};

export const commerceMagentoAdapter = {
  name: "commerce-magento",
  typeDefs,
  resolvers: {
    Query: {
      product: (_: unknown, { id }: { id: string }, ctx: CommerceMagentoContext) =>
        ctx.adapters.commerce.magento.getProduct(id),

      products: (_: unknown, { filter }: { filter?: unknown }, ctx: CommerceMagentoContext) =>
        ctx.adapters.commerce.magento.getProducts(filter),

      categories: (_: unknown, __: unknown, ctx: CommerceMagentoContext) =>
        ctx.adapters.commerce.magento.getCategories()
    },

    Mutation: {
      addToCart: (_: unknown, { input }: { input: unknown }, ctx: CommerceMagentoContext) =>
        ctx.adapters.commerce.magento.addToCart(input),

      updateCart: (_: unknown, { input }: { input: unknown }, ctx: CommerceMagentoContext) =>
        ctx.adapters.commerce.magento.updateCart(input),

      removeFromCart: (_: unknown, { itemId }: { itemId: string }, ctx: CommerceMagentoContext) =>
        ctx.adapters.commerce.magento.removeFromCart(itemId)
    }
  }
};