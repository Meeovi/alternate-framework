export * from "./src/index";

import { createItem, readFieldsByCollection, readItem } from "@directus/sdk";
import { directusGatewayClient } from "./utils/client";
import { handleDirectusError } from "./utils/errors";
import { normalizeDirectusPayload } from "./utils/normalizers";
import type { DirectusGatewayAdapterContract } from "./types";

export class DirectusAdapter implements DirectusGatewayAdapterContract {
  async getSchema(collection: string): Promise<unknown> {
    try {
      const payload = await directusGatewayClient.request(readFieldsByCollection(collection));
      return normalizeDirectusPayload(payload);
    } catch (error) {
      handleDirectusError(error);
    }
  }

  async getItem(collection: string, id: string): Promise<unknown> {
    try {
      const payload = await directusGatewayClient.request(readItem(collection as any, id));
      return normalizeDirectusPayload(payload);
    } catch (error) {
      handleDirectusError(error);
    }
  }

  async createItem(collection: string, input: Record<string, unknown>): Promise<unknown> {
    try {
      const payload = await directusGatewayClient.request(createItem(collection as any, input));
      return normalizeDirectusPayload(payload);
    } catch (error) {
      handleDirectusError(error);
    }
  }
}

export const createGatewayAdapterBindings = () => ({
  content: {
    directus: new DirectusAdapter()
  }
});