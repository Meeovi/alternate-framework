import type { FediversePost } from "../types";

export const normalizeActivityPubPost = (entry: any): FediversePost => {
  const object = entry?.object ?? entry;
  return {
    id: String(object?.id ?? object?.url ?? ""),
    protocol: "activitypub",
    author: String(object?.attributedTo ?? entry?.actor ?? "unknown"),
    content: String(object?.content ?? object?.summary ?? ""),
    createdAt: String(object?.published ?? object?.updated ?? new Date().toISOString()),
    url: object?.url
  };
};

export const normalizeAtprotoPost = (entry: any): FediversePost => ({
  id: String(entry?.post?.uri ?? entry?.uri ?? ""),
  protocol: "atproto",
  author: String(entry?.post?.author?.handle ?? entry?.post?.author?.did ?? "unknown"),
  content: String(entry?.post?.record?.text ?? entry?.record?.text ?? ""),
  createdAt: String(entry?.post?.record?.createdAt ?? entry?.indexedAt ?? new Date().toISOString()),
  url: entry?.post?.uri
});