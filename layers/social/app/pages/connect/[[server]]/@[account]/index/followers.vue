<script setup lang="ts">
import { useSelfAccount } from '../../../../../composables/contacts/users'
import { fetchAccountByHandle } from '../../../../../composables/core/cache'

const { t } = useLocate()
const params = useRoute().params
const handle = computed(() => params.account as string)

definePageMeta({ name: 'account-followers' })

const account = await fetchAccountByHandle(handle.value)
const paginator = account ? useMastoClient().v1.accounts.$select(account.id).followers.list() : null

const isSelf = computed(() => account ? useSelfAccount(account).value : false)

if (account) {
  useHydratedHead({
    title: () => `${t('account.followers')} | ${getDisplayName(account)} (@${account.acct})`,
  })
}
</script>

<template>
  <template v-if="paginator">
    <AccountPaginator :paginator="paginator" :relationship-context="isSelf ? 'followedBy' : undefined" context="followers" :account="account" />
  </template>
</template>
