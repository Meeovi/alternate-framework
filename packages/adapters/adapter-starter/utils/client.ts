import { createStarterTransport } from "../src/transport";

export interface StarterGatewayClientOptions {
  baseUrl?: string;
  apiKey?: string;
}

export const createStarterGatewayClient = (options: StarterGatewayClientOptions = {}) =>
  createStarterTransport({
    baseUrl: options.baseUrl ?? process.env.STARTER_API_URL ?? "http://localhost:3000",
    apiKey: options.apiKey ?? process.env.STARTER_API_KEY
  });