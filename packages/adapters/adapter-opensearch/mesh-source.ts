export default {
  name: "search-opensearch",
  handler: {
    graphql: {
      endpoint: process.env.ALTERNATE_SEARCH_GRAPHQL_URL,
      operationHeaders: {
        Authorization: `Bearer ${process.env.ALTERNATE_SEARCH_TOKEN ?? ""}`
      }
    }
  },
  transforms: ["./transforms/index.ts"]
};