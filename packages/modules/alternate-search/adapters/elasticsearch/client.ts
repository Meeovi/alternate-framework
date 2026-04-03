export type ElasticsearchClient = {
  createIndex(indexName: string, body: Record<string, unknown>): Promise<void>;
  bulk(operations: unknown[]): Promise<void>;
  search(indexName: string, body: Record<string, unknown>): Promise<{
    hits: {
      total: number | { value: number };
      hits: Array<{ _id: string; _source: Record<string, unknown>; highlight?: Record<string, string[]> }>;
    };
    aggregations?: Record<string, unknown>;
    took?: number;
  }>;
  delete(indexName: string, id: string): Promise<void>;
  deleteByQuery(indexName: string, query: Record<string, unknown>): Promise<{ deleted?: number }>;
  count(indexName: string): Promise<number>;
};

export type ElasticsearchMapping = {
  properties: Record<string, {
    type: string;
    analyzer?: string;
    dims?: number;
    similarity?: string;
    index?: boolean;
    fields?: Record<string, { type: string }>;
  }>;
};

type AuthConfig = {
  username?: string;
  password?: string;
  apiKey?: string;
};

export function createElasticsearchClient(
  baseUrl: string,
  auth: AuthConfig = {},
): ElasticsearchClient {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  function makeHeaders(contentType = "application/json"): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": contentType,
    };

    if (auth.apiKey) {
      headers.Authorization = `ApiKey ${auth.apiKey}`;
    } else if (auth.username && auth.password) {
      const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString("base64");
      headers.Authorization = `Basic ${encoded}`;
    }

    return headers;
  }

  async function request(
    path: string,
    options: RequestInit,
    allowedStatuses: number[] = [200],
  ): Promise<any> {
    const res = await fetch(`${normalizedBaseUrl}${path}`, {
      ...options,
      headers: {
        ...makeHeaders(options.body && String(options.body).includes("\n") ? "application/x-ndjson" : "application/json"),
        ...(options.headers ?? {}),
      },
    });

    const text = await res.text();
    const payload = text ? safeJsonParse(text) : undefined;

    if (!allowedStatuses.includes(res.status)) {
      const reason = payload?.error?.reason ?? payload?.error ?? text ?? res.statusText;
      throw new Error(`Elasticsearch request failed (${res.status}) ${path}: ${String(reason)}`);
    }

    return payload;
  }

  return {
    async createIndex(indexName, body) {
      await request(`/${encodeURIComponent(indexName)}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }, [200, 201, 400]);
    },

    async bulk(operations) {
      const ndjson = operations.map((op) => JSON.stringify(op)).join("\n") + "\n";
      const payload = await request("/_bulk?refresh=true", {
        method: "POST",
        body: ndjson,
      }, [200]);
      if (payload?.errors) {
        const firstFailed = Array.isArray(payload.items)
          ? payload.items.find((it: any) => {
              const key = Object.keys(it ?? {})[0];
              return Boolean(key && it[key]?.error);
            })
          : undefined;
        const reason = firstFailed
          ? JSON.stringify(firstFailed)
          : "Bulk indexing reported errors";
        throw new Error(reason);
      }
    },

    async search(indexName, body) {
      return await request(`/${encodeURIComponent(indexName)}/_search`, {
        method: "POST",
        body: JSON.stringify(body),
      }, [200]);
    },

    async delete(indexName, id) {
      await request(`/${encodeURIComponent(indexName)}/_doc/${encodeURIComponent(id)}?refresh=true`, {
        method: "DELETE",
      }, [200, 202, 404]);
    },

    async deleteByQuery(indexName, query) {
      const payload = await request(`/${encodeURIComponent(indexName)}/_delete_by_query?refresh=true`, {
        method: "POST",
        body: JSON.stringify({ query }),
      }, [200]);
      return { deleted: Number(payload?.deleted ?? 0) };
    },

    async count(indexName) {
      const payload = await request(`/${encodeURIComponent(indexName)}/_count`, {
        method: "GET",
      }, [200, 404]);
      if (!payload || payload.status === 404) return 0;
      return Number(payload.count ?? 0);
    },
  };
}

function safeJsonParse(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}
