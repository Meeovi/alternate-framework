export function getAuthorizationToken(): string | null {
  return null;
}

export function refreshAuthorizationToken(): Promise<void> {
  return Promise.resolve();
}

export type TokensByWebsite = Record<string, string>;
