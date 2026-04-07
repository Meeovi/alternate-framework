<script setup lang="ts">
import { useSelfAccount } from '../../../../../composables/contacts/users'
import { fetchAccountByHandle } from '../../../../../composables/core/cache'

const { t } = useLocate()
const params = useRoute().params
const handle = computed(() => params.account as string)

definePageMeta({ name: 'account-following' })

const account = await fetchAccountByHandle(handle.value)
const paginator = account ? useMastoClient().v1.accounts.$select(account.id).following.list() : null

const isSelf = computed(() => account ? useSelfAccount(account).value : false)

if (account) {
  useHydratedHead({
    title: () => `${t('account.following')} | ${getDisplayName(account)} (@${account.acct})`,
  })
}
</script>

<template>
  <template v-if="paginator">
    <AccountPaginator :paginator="paginator" :relationship-context="isSelf ? 'following' : undefined" context="following" :account="account" />
  </template>
</template>
