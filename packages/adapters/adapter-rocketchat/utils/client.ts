import { createRocketChatProvider } from "../src/runtime";

export const createRocketChatGatewayClient = () =>
  createRocketChatProvider({
    baseUrl: process.env.ROCKETCHAT_URL ?? "http://localhost:3001",
    token: process.env.ROCKETCHAT_TOKEN,
    userId: process.env.ROCKETCHAT_USER_ID
  });