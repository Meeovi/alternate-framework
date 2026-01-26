
export function isSeller(user: any): boolean {
  return !!(user && user.role === 'seller');
}

export function isSellerRoute(path: string): boolean {
  return path.startsWith('/dashboard/');
}
