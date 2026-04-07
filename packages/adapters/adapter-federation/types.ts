export type FediversePost = {
  id: string;
  protocol: "activitypub" | "atproto" | "ostatus" | "forgefed";
  author: string;
  content: string;
  createdAt: string;
  url?: string;
};

export type FediversePublishInput = {
  protocol: "activitypub" | "atproto" | "ostatus" | "forgefed";
  content: string;
  actor?: string;
  metadata?: Record<string, unknown>;
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
  publish(input: FediversePublishInput): Promise<unknown>;
  fanoutToLayers(payload: unknown): Promise<{ payload: unknown; layers: FediverseLayerAccess }>;
}