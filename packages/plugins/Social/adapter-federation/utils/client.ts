import { createActivitypubClient } from "../src/runtime/client";
import { createAtprotoGatewayClient } from "../src/clients/atproto";

export const activityPubGatewayClient =
  createActivitypubClient(process.env.ACTIVITYPUB_BASE_URL ?? process.env.ACTIVITYPUB_SERVER_URL ?? "/");

export const atprotoGatewayClient = createAtprotoGatewayClient();