export default {
  name: "chat-rocketchat",
  handler: {
    graphql: {
      endpoint: process.env.ROCKETCHAT_GRAPHQL_URL,
      operationHeaders: {
        Authorization: `Bearer ${process.env.ROCKETCHAT_TOKEN ?? ""}`
      }
    }
  },
  transforms: ["./transforms/index.ts"]
};