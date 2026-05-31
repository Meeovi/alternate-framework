type AnyRecord = Record<string, any>

export function resolveUserRelation(value: AnyRecord | null | undefined) {
  if (!value || typeof value !== 'object') return null
  return value.user || value.directus_users_id || value.directus_users || null
}

export function normalizeSpaceRecord(space: AnyRecord | null | undefined) {
  if (!space || typeof space !== 'object') return space

  const members = Array.isArray(space.members)
    ? space.members.map((member: AnyRecord) => ({
        ...member,
        user: resolveUserRelation(member),
      }))
    : []

  return {
    ...space,
    members,
  }
}

export function normalizeListRecord(list: AnyRecord | null | undefined) {
  if (!list || typeof list !== 'object') return list

  const user = list.user && typeof list.user === 'object'
    ? {
        ...list.user,
        profile: resolveUserRelation(list.user),
      }
    : list.user

  return {
    ...list,
    user,
  }
}
