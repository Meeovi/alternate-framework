export function hasAnyRole(userRoles: readonly string[], required: readonly string[]) {
  return required.some((r) => userRoles.includes(r))
}

export function hasAllRoles(userRoles: readonly string[], required: readonly string[]) {
  return required.every((r) => userRoles.includes(r))
}
