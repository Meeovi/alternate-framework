import { Principal } from './principals.js';
import { PermissionCheckContext, PermissionDecision } from './permissions.js';

export interface Policy {
  name: string;
  evaluate(
    principal: Principal | null,
    context: PermissionCheckContext
  ): PermissionDecision;
}

export class RoleBasedPolicy implements Policy {
  name = 'role-based';

  constructor(private readonly rolePermissions: Record<string, string[]>) {}

  evaluate(
    principal: Principal | null,
    context: PermissionCheckContext
  ): PermissionDecision {
    if (!principal) {
      return { allowed: false, reason: 'Unauthenticated' };
    }

    const needed = `${context.resource}:${context.action}`;
    const direct = principal.permissions ?? [];
    if (direct.includes(needed)) {
      return { allowed: true };
    }

    for (const role of principal.roles) {
      const perms = this.rolePermissions[role] ?? [];
      if (perms.includes(needed)) {
        return { allowed: true };
      }
    }

    return { allowed: false, reason: 'Permission not granted' };
  }
}
