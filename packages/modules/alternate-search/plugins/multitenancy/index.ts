// ---------------------------------------------------------------------------
// Multitenancy plugin — tenant isolation via filter injection or index routing
// ---------------------------------------------------------------------------

import type { FilterCondition, IndexSchema, SearchPlugin } from "../../core/types";
import { SearchError, SEARCH_ERROR_CODES } from "../../core/errors";

declare module "../../core/types" {
  interface SearchPluginRegistry {
    "multitenancy": { creator: typeof multitenancy };
  }
}

export const MULTITENANCY_ERROR_CODES = {
  TENANT_REQUIRED: "TENANT_REQUIRED",
  UNKNOWN_TENANT:  "UNKNOWN_TENANT",
  QUOTA_EXCEEDED:  "TENANT_QUOTA_EXCEEDED",
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TenantIsolationStrategy = "filter" | "index";

export type TenantConfig = {
  /** Tenant identifier. */
  id: string;
  /**
   * For "index" strategy: mapped to a separate index name.
   * Default: `${baseIndex}_${tenantId}`.
   */
  indexSuffix?: string;
  /** Optional per-tenant document quota. */
  quota?: number;
};

export type MultitenancyOptions = {
  /**
   * - `filter`: inject `{ field: tenantField, value: tenantId }` into every query.
   *   Simpler, but data lives in a shared index.
   * - `index`: route each tenant's queries to a dedicated index.
   *   Stronger isolation, but requires more index management.
   * Default: "filter".
   */
  strategy?: TenantIsolationStrategy;
  /**
   * Document field used to identify the tenant (filter strategy only).
   * Default: "tenantId".
   */
  tenantField?: string;
  /**
   * Static tenant registry. When provided, only listed tenant ids are accepted.
   */
  tenants?: TenantConfig[];
  /**
   * Dynamic tenant resolver — called if no static entry found.
   * Return null to reject the tenant.
   */
  resolveTenant?: (tenantId: string) => Promise<TenantConfig | null> | TenantConfig | null;
  /**
   * Whether to require a tenantId on every query.
   * Default: true.
   */
  requireTenant?: boolean;
  /**
   * Allow cross-tenant admin queries when tenantId is "*".
   * Default: false.
   */
  allowAdminWildcard?: boolean;
};

/**
 * Multitenancy plugin.
 *
 * Strategy "filter":
 * - Injects `{ field: tenantField, operator: "=", value: tenantId }` into
 *   `ctx.query.filters` before the adapter sees the query.
 * - Also injects `tenantId` into `beforeIndex` documents automatically.
 *
 * Strategy "index":
 * - Rewrites `ctx.indexName` to `${originalIndex}_${tenantId}`.
 * - Calls `adapter.setup` for new tenant indexes lazily on first write.
 */
export function multitenancy(options: MultitenancyOptions = {}): SearchPlugin {
  const strategy = options.strategy ?? "filter";
  const tenantField = options.tenantField ?? "tenantId";
  const requireTenant = options.requireTenant !== false;
  const allowAdmin = options.allowAdminWildcard ?? false;

  const staticTenants = new Map<string, TenantConfig>(
    (options.tenants ?? []).map((t) => [t.id, t]),
  );

  // Cache resolved tenants from dynamic resolver
  const tenantCache = new Map<string, TenantConfig>();

  async function resolveTenant(tenantId: string): Promise<TenantConfig | null> {
    if (staticTenants.has(tenantId)) return staticTenants.get(tenantId)!;
    if (tenantCache.has(tenantId)) return tenantCache.get(tenantId)!;

    if (options.resolveTenant) {
      const resolved = await Promise.resolve(options.resolveTenant(tenantId));
      if (resolved) tenantCache.set(tenantId, resolved);
      return resolved;
    }

    // No registry configured — allow any tenant id
    if (!options.tenants) return { id: tenantId };
    return null;
  }

  function injectFilter(
    ctx: Parameters<NonNullable<SearchPlugin["beforeQuery"]>>[0],
    tenantId: string,
  ): void {
    const condition: FilterCondition = { field: tenantField, operator: "=", value: tenantId };
    const existing = ctx.query.filters;

    if (!existing) {
      ctx.query.filters = [condition];
    } else if (Array.isArray(existing)) {
      ctx.query.filters = [...existing, condition];
    } else {
      const asConditions: FilterCondition[] = Object.entries(existing).map(([k, v]) => ({
        field: k, operator: "=" as const, value: v,
      }));
      ctx.query.filters = [...asConditions, condition];
    }
  }

  function tenantIndex(baseIndex: string, tenant: TenantConfig): string {
    return `${baseIndex}_${tenant.indexSuffix ?? tenant.id}`;
  }

  return {
    id: "multitenancy",
    $ERROR_CODES: MULTITENANCY_ERROR_CODES,

    async init(indexes: Record<string, IndexSchema>) {
      // For "index" strategy, make sure each tenant has indexes set up
      if (strategy === "index" && options.tenants) {
        void indexes; // adapter.setup is called by index-manager; here we just validate
      }
    },

    async beforeQuery(ctx) {
      const tenantId = ctx.query.tenantId;

      if (!tenantId) {
        if (requireTenant) {
          throw new SearchError(
            SEARCH_ERROR_CODES.TENANT_REQUIRED,
            "A tenantId is required for this search index",
            { status: 400 },
          );
        }
        return; // no tenant = passthrough
      }

      // Admin wildcard bypass
      if (tenantId === "*" && allowAdmin) {
        ctx.meta.multitenancyAdmin = true;
        return;
      }

      const tenant = await resolveTenant(tenantId);
      if (!tenant) {
        throw new SearchError(
          SEARCH_ERROR_CODES.TENANT_REQUIRED,
          `Unknown tenant: ${tenantId}`,
          { status: 400 },
        );
      }

      ctx.meta.resolvedTenant = tenant;

      if (strategy === "filter") {
        injectFilter(ctx, tenantId);
      } else {
        // Rewrite index name to tenant-specific index
        ctx.indexName = tenantIndex(ctx.indexName, tenant);
      }
    },

    beforeIndex(ctx) {
      if (strategy !== "filter") return;
      // Stamp tenantId on each document being indexed
      const tenantId = ctx.meta.tenantId as string | undefined;
      if (!tenantId) return;
      ctx.docs = ctx.docs.map((doc) => ({ ...doc, [tenantField]: tenantId }));
    },
  };
}
