import {
  createRelationshipTools,
  type mastodon,
} from '@mframework/adapter-federation'
import { openConfirmDialog } from '../../core/dialog'
import { currentUser } from '../../contacts/users'
import { useFederation, useFederationClient } from './masto'
import { getServerName } from './account'
const relationshipTools = createRelationshipTools({
  currentUser,
  useFederationClient: () => useFederationClient(),
  useFederation: () => ({ client: { value: useFederationClient() } }),
  openConfirmDialog: (options: Record<string, unknown>) => openConfirmDialog(options as any),
  t: (key: string, params: Record<string, unknown> | undefined) => (useNuxtApp() as any).$i18n.t(key, params),
  getServerName,
} as any)

export const useRelationship = relationshipTools.useRelationship
export const toggleFollowAccount = relationshipTools.toggleFollowAccount
export const toggleMuteAccount = relationshipTools.toggleMuteAccount
export const toggleBlockAccount = relationshipTools.toggleBlockAccount
export const toggleBlockDomain = relationshipTools.toggleBlockDomain
