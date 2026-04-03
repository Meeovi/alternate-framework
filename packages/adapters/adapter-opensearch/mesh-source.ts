export default {
  name: "search-opensearch",
  handler: {
    graphql: {
      endpoint: process.env.OPENSEARCH_GRAPHQL_URL,
      operationHeaders: {
        Authorization: `Bearer ${process.env.OPENSEARCH_TOKEN ?? ""}`
      }
    }
  },
  transforms: ["./transforms/index.ts"]
};