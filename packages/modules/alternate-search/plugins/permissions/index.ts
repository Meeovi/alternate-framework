// ---------------------------------------------------------------------------
// Permissions plugin — RBAC + field-level security + row-level security
// ---------------------------------------------------------------------------

import type { FilterCondition, SearchDocument, SearchPlugin } from "../../core/types";
import { SearchForbiddenError } from "../../core/errors";

declare module "../../core/types" {
  interface SearchPluginRegistry {
    "permissions": { creator: typeof permissions };
  }
}

export const PERMISSIONS_ERROR_CODES = {
  FORBIDDEN: "PERMISSIONS_FORBIDDEN",
  UNAUTHENTICATED: "PERMISSIONS_UNAUTHENTICATED",
  ROLE_REQUIRED: "PERMISSIONS_ROLE_REQUIRED",
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Permission = {
  /** Index name (or "*" for all indexes). */
  index: string;
  /** Allowed roles. Empty = public (no auth required). */
  roles?: string[];
  /**
   * Fields the user is NOT allowed to see.
   * These are stripped from results.
   */
  deniedFields?: string[];
  /**
   * Row-level security: extra filter automatically injected into the query.
   * Prevents post-filter data leaks by applying at the adapter level.
   */
  rlsFilter?: FilterCondition | FilterCondition[];
  /**
   * Custom check function. Return true to allow, false to deny.
   * Receives the current user id and roles.
   */
  check?: (context: { userId?: string; roles: string[]; indexName: string }) => boolean | Promise<boolean>;
};

export type PermissionsOptions = {
  permissions: Permission[];
  /**
   * Resolver that maps a userId to a list of roles.
   * Required when using role-based rules.
   */
  getRoles?: (userId: string) => Promise<string[]> | string[];
  /**
   * Require authenticated userId for all queries.
   * Default: false (unauthenticated queries are subject to matching rules only).
   */
  requireAuth?: boolean;
};

/**
 * Permissions plugin.
 *
 * For each query:
 * 1. Resolves the roles for `ctx.query.userId` via `getRoles`.
 * 2. Finds the `Permission` rule matching `ctx.indexName`.
 * 3. Runs role check → throws `SearchForbiddenError` on denial.
 * 4. Injects `rlsFilter` into `ctx.query.filters` (pre-adapter, prevents data
 *    leaks from post-filter enumeration).
 *
 * For each result (afterQuery):
 * 5. Strips `deniedFields` from every hit.
 */
export function permissions(options: PermissionsOptions): SearchPlugin {
  const { permissions: rules, getRoles, requireAuth = false } = options;

  function findRule(indexName: string): Permission | undefined {
    return (
      rules.find((r) => r.index === indexName) ??
      rules.find((r) => r.index === "*")
    );
  }

  function injectRlsFilter(ctx: Parameters<NonNullable<SearchPlugin["beforeQuery"]>>[0], filter: FilterCondition | FilterCondition[]): void {
    const extra = Array.isArray(filter) ? filter : [filter];
    const existing = ctx.query.filters;

    if (!existing) {
      ctx.query.filters = extra;
    } else if (Array.isArray(existing)) {
      ctx.query.filters = [...existing, ...extra];
    } else {
      // Convert Record<string,unknown> to FilterCondition[] and merge
      const asConditions: FilterCondition[] = Object.entries(existing).map(([k, v]) => ({
        field: k, operator: "=" as const, value: v,
      }));
      ctx.query.filters = [...asConditions, ...extra];
    }
  }

  function stripFields(doc: Record<string, unknown>, denied: string[]): Record<string, unknown> {
    const out = { ...doc };
    for (const f of denied) delete out[f];
    return out;
  }

  return {
    id: "permissions",
    $ERROR_CODES: PERMISSIONS_ERROR_CODES,

    async beforeQuery(ctx) {
      const userId = ctx.query.userId;

      if (requireAuth && !userId) {
        throw new SearchForbiddenError("Authentication required");
      }

      const rule = findRule(ctx.indexName);
      if (!rule) return; // No rule = allow all

      const userRoles = userId && getRoles ? await Promise.resolve(getRoles(userId)) : [];

      // Role check
      if (rule.roles && rule.roles.length > 0) {
        const hasRole = rule.roles.some((r) => userRoles.includes(r));
        if (!hasRole) {
          throw new SearchForbiddenError(
            `Access denied to index "${ctx.indexName}"`,
          );
        }
      }

      // Custom check
      if (rule.check) {
        const allowed = await Promise.resolve(
          rule.check({ userId, roles: userRoles, indexName: ctx.indexName }),
        );
        if (!allowed) {
          throw new SearchForbiddenError(
            `Custom permission check failed for index "${ctx.indexName}"`,
          );
        }
      }

      // RLS filter injection (pre-adapter = prevents enumeration attacks)
      if (rule.rlsFilter) {
        injectRlsFilter(ctx, rule.rlsFilter);
      }

      // Store resolved roles in meta for downstream plugins
      ctx.meta.resolvedRoles = userRoles;
    },

    afterQuery(ctx) {
      const rule = findRule(ctx.indexName);
      if (!rule?.deniedFields?.length) return;
      if (!ctx.result) return;

      ctx.result = {
        ...ctx.result,
        items: ctx.result.items.map((item) =>
          stripFields(item as Record<string, unknown>, rule.deniedFields!),
        ) as SearchDocument[],
      };
    },
  };
}
