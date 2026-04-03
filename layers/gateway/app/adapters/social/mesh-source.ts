import type { MeshAdapterSource } from "../mesh-types";

export const socialMeshSource = (): MeshAdapterSource => ({
  name: "social",
  handler: "graphql",
  endpoint: process.env.SOCIAL_GRAPHQL_URL ?? "http://localhost:4104/graphql"
});