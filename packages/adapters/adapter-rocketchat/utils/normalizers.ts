import type { RocketChatMessage, RocketChatRoom } from "../types";

export const normalizeRocketChatRoom = (room: any): RocketChatRoom => ({
  id: String(room?._id ?? room?.id ?? ""),
  name: room?.name ?? room?.fname,
  kind: room?.t
});

export const normalizeRocketChatMessage = (message: any): RocketChatMessage => ({
  id: String(message?._id ?? message?.id ?? ""),
  roomId: String(message?.rid ?? message?.roomId ?? ""),
  body: message?.msg ?? message?.body ?? "",
  senderId: message?.u?._id ?? message?.senderId,
  createdAt: message?.ts ?? message?.createdAt
});