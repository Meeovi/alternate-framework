export default {
  name: "starter-adapter",
  handler: {
    graphql: {
      endpoint: process.env.STARTER_GRAPHQL_URL,
      operationHeaders: {
        Authorization: `Bearer ${process.env.STARTER_API_KEY ?? ""}`
      }
    }
  },
  transforms: ["./transforms/index.ts"]
};