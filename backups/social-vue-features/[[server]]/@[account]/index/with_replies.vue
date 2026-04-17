<script setup lang="ts">
import { fetchAccountByHandle } from '../../../../../composables/core/cache'

definePageMeta({ name: 'account-replies' })

const { t } = useLocate()
const params = useRoute().params
const handle = computed(() => params.account as string)

const account = await fetchAccountByHandle(handle.value)

const paginator = account ? useMastoClient().v1.accounts.$select(account.id).statuses.list({ excludeReplies: false }) : null

if (account) {
  useHydratedHead({
    title: () => `${t('tab.posts_with_replies')} | ${getDisplayName(account)} (@${account.acct})`,
  })
}
</script>

<template>
  <div>
    <AccountTabs />
    <TimelinePaginator :paginator="paginator" :preprocess="filterAndReorderTimeline" context="account" :account="account" />
  </div>
</template>
