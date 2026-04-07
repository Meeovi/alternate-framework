<script setup lang="ts">
import { fetchAccountByHandle } from '../../../../../composables/core/cache'

definePageMeta({ name: 'account-media' })

const { t } = useLocate()
const params = useRoute().params
const handle = computed(() => params.account as string)

const account = await fetchAccountByHandle(handle.value)

const paginator = account ? useMastoClient().v1.accounts.$select(account.id).statuses.list({ onlyMedia: true, excludeReplies: false }) : null

if (account) {
  useHydratedHead({
    title: () => `${t('tab.media')} | ${getDisplayName(account)} (@${account.acct})`,
  })
}
</script>

<template>
  <div>
    <AccountTabs />
    <TimelinePaginator :paginator="paginator" :preprocess="filterAndReorderTimeline" context="account" :account="account" />
  </div>
</template>
