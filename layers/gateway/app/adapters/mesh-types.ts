export type MeshAdapterSource = {
  name: string;
  handler: "graphql" | "openapi";
  endpoint: string;
  headers?: Record<string, string>;
};