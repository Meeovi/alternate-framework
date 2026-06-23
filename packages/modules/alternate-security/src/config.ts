export interface AlternateSecurityConfig {
  rateLimit?: {
    windowMs: number;
    max: number;
    keyPrefix?: string;
  };
  ipReputation?: {
    suspiciousThreshold: number;
    windowMs: number;
  };
  roles?: Record<string, string[]>;
}

export function defaultSecurityConfig(): AlternateSecurityConfig {
  return {
    rateLimit: {
      windowMs: 60_000,
      max: 60,
      keyPrefix: 'rl'
    },
    ipReputation: {
      suspiciousThreshold: 10,
      windowMs: 5 * 60_000
    },
    roles: {
      admin: ['*:*'],
      user: [
        'communication:message:create',
        'communication:message:read',
        'search:query:execute'
      ]
    }
  };
}
