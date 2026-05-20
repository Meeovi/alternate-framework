<script setup lang="ts">
import type { ElkNotificationFilterType } from '../../constants'
import { NOTIFICATION_FILTER_TYPES } from '../../constants'
import { isNotificationFilter } from '../../composables/notifications/notification'

type CommonRouteTabOption = {
  name: string
  to: string
  display: string
  icon?: string
  match?: boolean
}

type CommonRouteTabMoreOption = {
  options: CommonRouteTabOption[]
  icon: string
  tooltip: string
  match: boolean
}

definePageMeta({})

const route = useRoute()
const pwaEnabled = useAppConfig().pwaEnabled
const isHydrated = computed(() => import.meta.client)

const t = (key: string) => {
  const labels: Record<string, string> = {
    'nav.notifications': 'Notifications',
    'tab.notifications_all': 'All',
    'tab.notifications_mention': 'Mentions',
    'tab.notifications_more_tooltip': 'Filter notifications',
    'settings.notifications.show_btn': 'Notification settings',
  }

  if (labels[key]) return labels[key]

  if (key.startsWith('tab.notifications_')) {
    return key.replace('tab.notifications_', '').replaceAll('_', ' ')
  }

  return key
}

const tabs = computed<CommonRouteTabOption[]>(() => [
  {
    name: 'all',
    to: '/notifications',
    display: t('tab.notifications_all'),
  },
  {
    name: 'mention',
    to: '/notifications/mention',
    display: t('tab.notifications_mention'),
  },
])

const filter = computed<ElkNotificationFilterType | undefined>(() => {
  if (!isHydrated.value) return undefined

  const rawFilter = route.params?.filter
  const actualFilter = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter
  if (typeof actualFilter === 'string' && isNotificationFilter(actualFilter)) return actualFilter

  return undefined
})

const filterIconMap: Record<ElkNotificationFilterType, string> = {
  all: 'i-ri:notification-4-line',
  mention: 'i-ri:at-line',
  status: 'i-ri:account-pin-circle-line',
  reblog: 'i-ri:repeat-fill',
  quote: 'i-ri:double-quotes-l',
  quoted_update: 'i-ri:double-quotes-l',
  follow: 'i-ri:user-follow-line',
  follow_request: 'i-ri:user-shared-line',
  favourite: 'i-ri:heart-3-line',
  poll: 'i-ri:chat-poll-line',
  update: 'i-ri:edit-2-line',
  'admin.sign_up': 'i-ri:user-add-line',
  'admin.report': 'i-ri:flag-line',
  severed_relationships: 'i-ri:user-unfollow-line',
  moderation_warning: 'i-ri:error-warning-line',
}

const filterText = computed(() => `${t('tab.notifications_more_tooltip')}${filter.value ? `: ${t(`tab.notifications_${filter.value}`)}` : ''}`)
const notificationFilterRoutes = computed<CommonRouteTabOption[]>(() => NOTIFICATION_FILTER_TYPES.map(
  (name: ElkNotificationFilterType) => ({
    name,
    to: `/notifications/${name}`,
    display: t(`tab.notifications_${name}`),
    icon: filterIconMap[name],
    match: name === filter.value,
  }),
))

const moreOptions = computed<CommonRouteTabMoreOption>(() => ({
  options: notificationFilterRoutes.value,
  icon: 'i-ri:filter-2-line',
  tooltip: filterText.value,
  match: !!filter.value,
}))
</script>

<template>
  <MainContent>
    <template #title>
      <MainTitle as="router-link" to="/notifications" icon="i-ri:notification-4-line">
        {{ t('nav.notifications') }}
      </MainTitle>
    </template>

    <template #actions>
      <NuxtLink
        flex rounded-4 p1
        hover:bg-active cursor-pointer transition-100
        :title="t('settings.notifications.show_btn')"
        to="/settings/notifications"
      >
        <span aria-hidden="true" i-ri:notification-badge-line />
      </NuxtLink>
    </template>

    <template>
      <CommonRouteTabs replace :options="tabs" :more-options="moreOptions" />
    </template>

    <slot>
      <template v-if="pwaEnabled">
        <NotificationPreferences />
      </template>

      <NuxtPage />
    </slot>
  </MainContent>
</template>
