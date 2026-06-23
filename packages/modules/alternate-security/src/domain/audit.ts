export type AuditAction =
  | 'access.granted'
  | 'access.denied'
  | 'auth.login'
  | 'auth.logout'
  | 'auth.register'
  | 'security.rate-limit'
  | 'security.suspicious';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  principalId?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
