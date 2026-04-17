import {
  createStatusActionTools,
  type StatusActionsProps,
} from '@mframework/adapter-federation'
import { cacheStatus } from './statusCache'
import { checkLogin, currentUser } from '../../contacts/users'

const statusActionTools = createStatusActionTools({
  checkLogin,
  currentUser,
  useFederation,
  cacheStatus,
  navigateTo,
})

export function useStatusActions(props: StatusActionsProps) {
  return statusActionTools.useStatusActions(props)
}
