import type { MeshAdapterSource } from "../mesh-types";

export const searchMeshSource = (): MeshAdapterSource => ({
  name: "search",
  handler: "graphql",
  endpoint: process.env.SEARCH_GRAPHQL_URL ?? "http://localhost:4103/graphql"
});