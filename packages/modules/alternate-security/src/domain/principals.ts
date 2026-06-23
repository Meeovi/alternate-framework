export type PrincipalType = 'user' | 'service' | 'anonymous';

export interface Principal {
  id: string;
  type: PrincipalType;
  roles: string[];
  permissions?: string[];
}
