export function updateCustomerSignInStatus(isSignedIn: boolean, customer?: any) {
  if (typeof window !== 'undefined' && 'CustomEvent' in window) {
    window.dispatchEvent(new CustomEvent('mframework:auth:update', { detail: { isSignedIn, customer } }))
  }
}

export default { updateCustomerSignInStatus }
