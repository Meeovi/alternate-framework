import { createMeeoviDirectusClient } from "../src/client/createClient";

const baseUrl = process.env.DIRECTUS_URL ?? "http://localhost:8055";

export const directusGatewayClient = createMeeoviDirectusClient<any>(baseUrl);