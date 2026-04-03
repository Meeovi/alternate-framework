export type FediversePost = {
  id: string;
  protocol: "activitypub" | "atproto";
  author: string;
  content: string;
  createdAt: string;
  url?: string;
};

export type FediverseLayerAccess = {
  social: { federation: true };
  chat: { federation: true };
  lists: { federation: true };
  search: { federation: true };
  content: { federation: true };
};

export interface FederationGatewayAdapterContract {
  getActivityPubInbox(actor: string): Promise<unknown>;
  getActivityPubOutbox(actor: string, limit?: number): Promise<FediversePost[]>;
  getAtprotoProfile(handle: string): Promise<unknown | null>;
  getAtprotoFeed(actor: string, limit?: number): Promise<FediversePost[]>;
  getUnifiedFeed(identity: string, limit?: number): Promise<FediversePost[]>;
  publish(input: { protocol: "activitypub" | "atproto"; content: string; actor?: string }): Promise<unknown>;
  fanoutToLayers(payload: unknown): Promise<{ payload: unknown; layers: FediverseLayerAccess }>;
}