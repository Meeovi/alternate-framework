
export function normalizeTrailingSlash(path: string) {
  if (path !== '/' && path.endsWith('/')) {
    return path.replace(/\/+$/, '') || '/';
  }
  return null;
}
