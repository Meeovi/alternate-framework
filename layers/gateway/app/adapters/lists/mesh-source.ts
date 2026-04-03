import type { MeshAdapterSource } from "../mesh-types";

export const listsMeshSource = (): MeshAdapterSource => ({
  name: "lists",
  handler: "graphql",
  endpoint: process.env.LISTS_GRAPHQL_URL ?? "http://localhost:4105/graphql"
});