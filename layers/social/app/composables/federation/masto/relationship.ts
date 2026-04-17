import {
  createRelationshipTools,
  type mastodon,
} from '@mframework/adapter-federation'
import { openConfirmDialog } from '../../core/dialog'
const relationshipTools = createRelationshipTools({
  currentUser,
  useFederationClient,
  useFederation,
  openConfirmDialog,
  t: (key, params) => (useNuxtApp() as any).$i18n.t(key, params),
  getServerName,
})

export const useRelationship = relationshipTools.useRelationship
export const toggleFollowAccount = relationshipTools.toggleFollowAccount
export const toggleMuteAccount = relationshipTools.toggleMuteAccount
export const toggleBlockAccount = relationshipTools.toggleBlockAccount
export const toggleBlockDomain = relationshipTools.toggleBlockDomain
