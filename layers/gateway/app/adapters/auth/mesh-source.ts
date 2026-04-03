import type { MeshAdapterSource } from "../mesh-types";

export const authMeshSource = (): MeshAdapterSource => ({
  name: "auth",
  handler: "graphql",
  endpoint: process.env.AUTH_GRAPHQL_URL ?? "http://localhost:4101/graphql"
});