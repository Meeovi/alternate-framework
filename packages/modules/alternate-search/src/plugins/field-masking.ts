import type { IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
  interface SearchPluginRegistry {
    "field-masking": { creator: typeof fieldMasking };
  }
}

export type FieldMaskingOptions = {
  /**
   * Role to hidden-field mapping.
   * Special key "*" applies globally.
   */
  hiddenByRole: Record<string, string[] | Record<string, string[]>>;
  /** Metadata key containing roles (array or string). Default: "roles". */
  rolesMetaKey?: string;
  /** Metadata key containing a single role fallback. Default: "role". */
  roleMetaKey?: string;
};

function getRoles(meta: Record<string, unknown>, rolesMetaKey: string, roleMetaKey: string): string[] {
  const fromRoles = meta[rolesMetaKey];
  if (Array.isArray(fromRoles)) {
    return fromRoles.map((value) => String(value));
  }
  if (typeof fromRoles === "string") {
    return [fromRoles];
  }

  const fromRole = meta[roleMetaKey];
  if (typeof fromRole === "string") {
    return [fromRole];
  }

  return [];
}

function toIndexMap(value: string[] | Record<string, string[]>): Record<string, string[]> {
  if (Array.isArray(value)) {
    return { "*": value };
  }
  return value;
}

export function fieldMasking(options: FieldMaskingOptions): SearchPlugin {
  const rolesMetaKey = options.rolesMetaKey ?? "roles";
  const roleMetaKey = options.roleMetaKey ?? "role";

  return {
    id: "field-masking",

    init(_indexes: Record<string, IndexSchema>) {},

    afterQuery(ctx) {
      if (!ctx.result?.items?.length) return;

      const roles = getRoles(ctx.meta, rolesMetaKey, roleMetaKey);
      if (roles.length === 0) return;

      const hiddenFields = new Set<string>();

      for (const role of roles) {
        const roleConfig = options.hiddenByRole[role];
        if (!roleConfig) continue;

        const indexMap = toIndexMap(roleConfig);
        for (const field of indexMap["*"] ?? []) {
          hiddenFields.add(field);
        }
        for (const field of indexMap[ctx.indexName] ?? []) {
          hiddenFields.add(field);
        }
      }

      if (hiddenFields.size === 0) return;

      ctx.result.items = ctx.result.items.map((item) => {
        const next = { ...(item as Record<string, unknown>) };
        for (const field of hiddenFields) {
          delete next[field];
        }
        return next;
      });

      const existing = (ctx.meta.maskedFields as string[] | undefined) ?? [];
      ctx.meta.maskedFields = [...new Set([...existing, ...hiddenFields])];
    },
  };
}
