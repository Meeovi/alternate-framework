import { createStarterTransport } from "../src/transport";

export const createStarterGatewayClient = () =>
  createStarterTransport({
    baseUrl: process.env.STARTER_API_URL ?? "http://localhost:3000",
    apiKey: process.env.STARTER_API_KEY
  });