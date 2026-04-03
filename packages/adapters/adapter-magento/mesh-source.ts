export default {
  name: "commerce-magento",
  handler: {
    graphql: {
      endpoint: process.env.MAGENTO_GRAPHQL_URL,
      operationHeaders: {
        Authorization: `Bearer ${process.env.MAGENTO_TOKEN ?? ""}`
      }
    }
  },
  transforms: ["./transforms/index.ts"]
};