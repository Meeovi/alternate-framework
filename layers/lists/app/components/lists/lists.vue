<script setup lang="ts">
import { ref } from 'vue';
import { useMastoClient } from '../../composables/masto'

const { userId } = defineProps<{
  userId: string
}>()

const client = useMastoClient()
const paginator = client ? client.v1.lists.list() : null
const listsWithUser = ref((await (client ? client.v1.accounts.$select(userId).lists.list() : Promise.resolve([]))).map((list: any) => list.id))

function indexOfUserInList(listId: string) {
  return listsWithUser.value.indexOf(listId)
}

async function edit(listId: string) {
  try {
    const index = indexOfUserInList(listId)
    if (index === -1) {
      await client.value.v1.lists.$select(listId).accounts.create({ accountIds: [userId] })
      listsWithUser.value.push(listId)
    }
    else {
      await client.value.v1.lists.$select(listId).accounts.remove({ accountIds: [userId] })
      listsWithUser.value = listsWithUser.value.filter((id: string) => id !== listId)
    }
  }
  catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <CommonPaginator :paginator="paginator">
    <template #default="{ item }">
      <div p4 hover:bg-active block w="100%" flex justify-between items-center gap-4>
        <p>{{ item.title }}</p>
        <CommonTooltip
          :content="indexOfUserInList(item.id) === -1 ? $t('list.add_account') : $t('list.remove_account')"
          :hover="indexOfUserInList(item.id) === -1 ? 'text-green' : 'text-red'"
        >
          <v-btn
            text-sm p2 border-1 transition-colors
            border-dark
            btn-action-icon
            @click="() => edit(item.id)"
          >
            <span :class="indexOfUserInList(item.id) === -1 ? 'i-ri:user-add-line' : 'i-ri:user-unfollow-line'" />
          </v-btn>
        </CommonTooltip>
      </div>
    </template>
    <template #done>
      <NuxtLink
        p4 hover:bg-active block w="100%" flex justify-between items-center gap-4
        to="/lists"
      >
        <p>{{ $t('list.manage') }}</p>
      </NuxtLink>
    </template>
  </CommonPaginator>
</template>
