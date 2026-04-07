import type { MeshAdapterSource } from "../mesh-types";

export const chatMeshSource = (): MeshAdapterSource => ({
  name: "chat",
  handler: "graphql",
  endpoint: process.env.CHAT_GRAPHQL_URL ?? "http://localhost:4106/graphql"
});