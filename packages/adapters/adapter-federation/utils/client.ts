import { createActivitypubClient } from "../src/runtime/client";

const atprotoBaseUrl = process.env.ATPROTO_BASE_URL ?? "https://public.api.bsky.app";

export const activityPubGatewayClient =
  createActivitypubClient(process.env.ACTIVITYPUB_BASE_URL ?? process.env.ACTIVITYPUB_SERVER_URL ?? "/");

const atprotoRequest = async (path: string, init?: RequestInit) => {
  const target = `${atprotoBaseUrl.replace(/\/$/, "")}${path}`;
  const response = await fetch(target, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(process.env.ATPROTO_TOKEN
        ? { Authorization: `Bearer ${process.env.ATPROTO_TOKEN}` }
        : {}),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`ATProto request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const atprotoGatewayClient = {
  getProfile: (actor: string) =>
    atprotoRequest(`/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(actor)}`),
  getAuthorFeed: (actor: string, limit = 20) =>
    atprotoRequest(
      `/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(actor)}&limit=${encodeURIComponent(String(limit))}`
    ),
  createRecord: (repo: string, collection: string, record: Record<string, unknown>) =>
    atprotoRequest("/xrpc/com.atproto.repo.createRecord", {
      method: "POST",
      body: JSON.stringify({ repo, collection, record })
    })
};