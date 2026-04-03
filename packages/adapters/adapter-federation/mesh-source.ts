export default {
  name: "federation-fediverse",
  handler: {
    graphql: {
      endpoint: process.env.FEDIVERSE_GRAPHQL_URL,
      operationHeaders: {
        Authorization: `Bearer ${process.env.FEDIVERSE_TOKEN ?? ""}`
      }
    }
  },
  transforms: ["./transforms/index.ts"]
};