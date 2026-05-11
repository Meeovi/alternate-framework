<script setup lang="ts">
import { definePageMeta, useHead } from '~/composables/core/vue'
import type { CommonRouteTabMoreOption, CommonRouteTabOption } from '../../../../shared/shared/types'
import { useLocate } from 'alternate-gateway/locate/adapters/vue/composable'
import type { ElkNotificationFilterType } from '~/constants'
import type { mastodon } from 'masto'
import { NOTIFICATION_FILTER_TYPES } from '~/constants'
import { isHydrated, useHydratedHead } from '~/composables/core/vue'
import { isNotificationFilter } from '~/composables/notifications/notification'

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const { t } = useLocate()
const pwaEnabled = useAppConfig().pwaEnabled

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
  if (!isHydrated.value)
    return undefined

  const rawFilter = route.params?.filter
  const actualFilter = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter
  if (typeof actualFilter === 'string' && isNotificationFilter(actualFilter))
    return actualFilter

  return undefined
})

const filterIconMap: Record<ElkNotificationFilterType, string> = {
  'all': 'i-ri:notification-4-line',
  'mention': 'i-ri:at-line',
  'status': 'i-ri:account-pin-circle-line',
  'reblog': 'i-ri:repeat-fill',
  'quote': 'i-ri:double-quotes-l',
  'quoted_update': 'i-ri:double-quotes-l',
  'follow': 'i-ri:user-follow-line',
  'follow_request': 'i-ri:user-shared-line',
  'favourite': 'i-ri:heart-3-line',
  'poll': 'i-ri:chat-poll-line',
  'update': 'i-ri:edit-2-line',
  'admin.sign_up': 'i-ri:user-add-line',
  'admin.report': 'i-ri:flag-line',
  'severed_relationships': 'i-ri:user-unfollow-line',
  'moderation_warning': 'i-ri:error-warning-line',
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
