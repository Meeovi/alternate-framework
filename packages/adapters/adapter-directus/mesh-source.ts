export default {
  name: "content-directus",
  handler: {
    graphql: {
      endpoint: process.env.DIRECTUS_GRAPHQL_URL,
      operationHeaders: {
        Authorization: `Bearer ${process.env.DIRECTUS_TOKEN ?? ""}`
      }
    }
  },
  transforms: ["./transforms/index.ts"]
};