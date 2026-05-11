import {
  createStatusActionTools,
  type StatusActionsProps,
} from '@mframework/adapter-federation'
import { cacheStatus } from './statusCache'
import { navigateTo } from '#imports'
import { checkLogin, currentUser } from '../../contacts/users'
import { useFederationClient } from './masto'

const statusActionTools = createStatusActionTools({
  checkLogin,
  currentUser,
  useFederation: () => ({ client: { value: useFederationClient() } }),
  cacheStatus,
  navigateTo,
} as any)

export function useStatusActions(props: StatusActionsProps) {
  return statusActionTools.useStatusActions(props)
}
