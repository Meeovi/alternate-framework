import type { MeshAdapterSource } from "../mesh-types";

export const sellerMeshSource = (): MeshAdapterSource => ({
  name: "seller",
  handler: "graphql",
  endpoint: process.env.SELLER_GRAPHQL_URL ?? "http://localhost:4107/graphql"
});