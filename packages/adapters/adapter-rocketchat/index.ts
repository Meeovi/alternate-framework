export * from "./src/index";

import { createRocketChatGatewayClient } from "./utils/client";
import { handleRocketChatError } from "./utils/errors";
import {
  normalizeRocketChatMessage,
  normalizeRocketChatRoom
} from "./utils/normalizers";
import type { RocketChatGatewayAdapterContract, RocketChatMessage, RocketChatRoom } from "./types";

export class RocketChatAdapter implements RocketChatGatewayAdapterContract {
  private readonly provider = createRocketChatGatewayClient();

  async listRooms(): Promise<RocketChatRoom[]> {
    try {
      const rooms = await this.provider.listRooms?.();
      return (rooms ?? []).map((room: any) => normalizeRocketChatRoom(room));
    } catch (error) {
      handleRocketChatError(error);
    }
  }

  async getMessages(roomId: string, limit = 50): Promise<RocketChatMessage[]> {
    try {
      const messages = await this.provider.getMessages?.(roomId, { count: limit });
      return (messages ?? []).map((message: any) => normalizeRocketChatMessage(message));
    } catch (error) {
      handleRocketChatError(error);
    }
  }

  async sendMessage(roomId: string, body: string): Promise<RocketChatMessage> {
    try {
      const message = await this.provider.sendMessage?.(roomId, body);
      return normalizeRocketChatMessage(message);
    } catch (error) {
      handleRocketChatError(error);
    }
  }
}

export const createGatewayAdapterBindings = () => ({
  chat: {
    rocketchat: new RocketChatAdapter()
  }
});