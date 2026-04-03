export type RocketChatRoom = {
  id: string;
  name?: string;
  kind?: string;
};

export type RocketChatMessage = {
  id: string;
  roomId: string;
  body: string;
  senderId?: string;
  createdAt?: string;
};

export interface RocketChatGatewayAdapterContract {
  listRooms(): Promise<RocketChatRoom[]>;
  getMessages(roomId: string, limit?: number): Promise<RocketChatMessage[]>;
  sendMessage(roomId: string, body: string): Promise<RocketChatMessage>;
}