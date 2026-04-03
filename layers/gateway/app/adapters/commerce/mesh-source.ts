import type { MeshAdapterSource } from "../mesh-types";

export const commerceMeshSource = (): MeshAdapterSource => ({
  name: "commerce",
  handler: "graphql",
  endpoint: process.env.COMMERCE_GRAPHQL_URL ?? "http://localhost:4102/graphql"
});