export type Permission = string; // e.g. "communication:message:create"

export interface PermissionCheckContext {
  resource: string;
  action: string;
  attributes?: Record<string, unknown>;
}

export interface PermissionDecision {
  allowed: boolean;
  reason?: string;
}
