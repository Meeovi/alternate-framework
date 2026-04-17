// types/componentMap.ts
// Typed central place for space content component loaders
import type { DefineComponent } from 'vue'

export type AsyncComponentLoader = () => Promise<DefineComponent | { default: DefineComponent } | any>

export const componentMap: AsyncComponentLoader[] = [
  () => import('../../../social/app/components/features/spaceSections/defaultSpaces.vue'),
  () => import('../../../social/app/components/features/spaceSections/audioSpaces.vue'),
  () => import('../../../social/app/components/features/spaceSections/videoSpaces.vue'),
  () => import('../../../social/app/components/features/spaceSections/imageSpaces.vue'),
  () => import('../../../social/app/components/features/spaceSections/textSpaces.vue'),
  () => import('../../../social/app/components/features/birthdays.vue'),
  () => import('../../../social/app/components/features/channels.vue'),
  () => import('../../../social/app/components/features/chat.vue'),
  () => import('../../../social/app/components/features/directory.vue'),
  () => import('../../../social/app/components/features/events.vue'),
  () => import('../../../social/app/components/features/feeds.vue'),
  () => import('../../../social/app/components/features/friends.vue'),
  () => import('../../../social/app/components/features/hashtags.vue'),
  () => import('../../../social/app/components/features/invites.vue'),
  () => import('../../../social/app/components/features/media.vue'),
  () => import('../../../social/app/components/features/members.vue'),
  () => import('../../../social/app/components/features/memories.vue'),
  () => import('../../../social/app/components/features/messages.vue'),
  () => import('../../../social/app/components/features/radio.vue'),
  () => import('../../../social/app/components/features/rooms.vue'),
  () => import('../../../social/app/components/features/spaces.vue'),
  () => import('../../../social/app/components/features/teams.vue'),
  () => import('../../../social/app/components/features/vibez.vue'),
]

export default componentMap
