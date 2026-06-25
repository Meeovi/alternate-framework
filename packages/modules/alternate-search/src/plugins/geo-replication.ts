// ---------------------------------------------------------------------------
// Geo-replication plugin — cross-region write replication and read routing
// ---------------------------------------------------------------------------
//
// Extends the write-replication concept to multiple geographic regions.
// Documents indexed into any region are forwarded to all configured peer
// regions.  Read queries are optionally routed to the nearest region based
// on a latency table or an explicit `ctx.meta.region` tag.
// ---------------------------------------------------------------------------

import type { IndexContext, IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
  interface SearchPluginRegistry {
    "geo-replication": { creator: typeof geoReplication };
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RegionConfig = {
  /** Unique region identifier (e.g. "us-east-1", "eu-west-1"). */
  id: string;
  /**
   * Async function to replicate documents to this region's search backend.
   */
  replicate: (ctx: IndexContext) => Promise<void>;
  /**
   * Relative latency score (lower = preferred for reads).  Default: 0.
   * Set dynamically via `updateLatency()` based on real measurements.
   */
  latencyMs?: number;
};

export type GeoReplicationOptions = {
  regions: RegionConfig[];
  /**
   * ID of the "local" region.  Writes originating here are not looped back.
   */
  localRegion?: string;
  /**
   * When true, replication errors are swallowed and recorded in `ctx.meta`.
   * Default: true.
   */
  tolerateErrors?: boolean;
  /**
   * When true, all peer replication runs in parallel.  Default: true.
   */
  parallel?: boolean;
  /**
   * Inject `_options.nodeUrl` of the best-latency region into read queries.
   * Only useful when regions expose a `nodeUrl` getter.  Default: false.
   */
  routeReads?: boolean;
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function geoReplication(options: GeoReplicationOptions): SearchPlugin & {
  updateLatency(regionId: string, latencyMs: number): void;
} {
  const tolerateErrors = options.tolerateErrors !== false;
  const parallel       = options.parallel !== false;

  // Live latency map
  const latencies = new Map<string, number>(
    options.regions.map((r) => [r.id, r.latencyMs ?? 0]),
  );

  function peerRegions(): RegionConfig[] {
    return options.localRegion
      ? options.regions.filter((r) => r.id !== options.localRegion)
      : options.regions;
  }

  return {
    id: "geo-replication",

    updateLatency(regionId: string, latencyMs: number) {
      latencies.set(regionId, latencyMs);
    },

    init(_indexes: Record<string, IndexSchema>) {},

    beforeQuery(ctx) {
      if (!options.routeReads) return;
      const peers = peerRegions();
      if (!peers.length) return;

      // Route to lowest-latency peer
      const sorted = peers.slice().sort(
        (a, b) => (latencies.get(a.id) ?? 0) - (latencies.get(b.id) ?? 0),
      );
      ctx.meta.geoRegion = sorted[0].id;
    },

    async afterIndex(ctx: IndexContext) {
      const peers = peerRegions();
      if (!peers.length) return;

      const replicationCtx: IndexContext = {
        ...ctx,
        meta: { ...ctx.meta, isGeoReplica: true },
      };

      if (parallel) {
        const results = await Promise.allSettled(
          peers.map((r) => r.replicate(replicationCtx)),
        );

        const failures = results
          .map((r, i) => ({
            status: r.status,
            region: peers[i].id,
            reason: r.status === "rejected" ? (r as PromiseRejectedResult).reason : null,
          }))
          .filter((r) => r.status === "rejected");

        if (failures.length > 0) {
          ctx.meta.geoReplicationErrors = failures.map((f) => ({
            region: f.region,
            error:  String(f.reason instanceof Error ? f.reason.message : f.reason),
          }));
          if (!tolerateErrors) throw failures[0].reason;
        }
      } else {
        for (const region of peers) {
          try {
            await region.replicate(replicationCtx);
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            const existing = ctx.meta.geoReplicationErrors as Array<unknown> | undefined;
            if (existing) {
              existing.push({ region: region.id, error: errMsg });
            } else {
              ctx.meta.geoReplicationErrors = [{ region: region.id, error: errMsg }];
            }
            if (!tolerateErrors) throw err;
          }
        }
      }
    },
  };
}
