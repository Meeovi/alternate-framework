<template>
  <!-- A list from another network (a Bluesky list of accounts), shown on
       Meeovi: its accounts open as profiles here, and the original list is
       credited at the bottom. -->
  <div class="contentPage">
    <v-toolbar color="primary" dark>
      <v-avatar v-if="list?.avatar" :image="list.avatar" size="32" class="ms-4" />
      <v-toolbar-title>{{ list?.name || 'List' }}</v-toolbar-title>
    </v-toolbar>

    <div v-if="pending && !list" class="pa-4">Loading...</div>
    <div v-else-if="!list" class="pa-4">This list doesn't exist or isn't public.</div>
    <div v-else class="pa-4">
      <p v-if="list.description" class="mb-4 listDescription">{{ list.description }}</p>

      <v-row v-if="accounts.length">
        <v-col v-for="item in accounts" :key="item.id" cols="12" sm="6" md="4" lg="3">
          <v-card :to="federatedProfilePath(item.actor) || undefined" variant="outlined" class="h-100">
            <v-card-item>
              <template #prepend>
                <v-avatar v-if="item.actor.avatar" :image="item.actor.avatar" />
                <v-icon v-else icon="fas fa-user-circle" size="40" />
              </template>
              <v-card-title>{{ item.actor.displayName || item.actor.handle }}</v-card-title>
              <v-card-subtitle>@{{ item.actor.handle }}</v-card-subtitle>
            </v-card-item>
            <v-card-text v-if="item.actor.bio" class="accountBio">{{ item.actor.bio }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <p v-else class="text-medium-emphasis">This list is empty.</p>

      <sourceAttribution class="mt-6" kind="list" :url="list.url" :network="list.network" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import sourceAttribution from '../../blocks/sourceAttribution.vue'
import { federatedProfilePath } from '../../../utils/postPath'
import type { FederatedList, FederatedListItem } from '../../../../shared/types/federation'

const props = defineProps<{
  /** 'atproto' */
  network: string
  /** The list's id on its network (at:// URI). */
  id: string
}>()

const { data, pending } = await useAsyncData(
  () => `federated-list:${props.network}:${props.id}`,
  () => $fetch<{ list: FederatedList, items: FederatedListItem[] }>(`/api/social/federation/${props.network}/list`, {
    query: { id: props.id },
  }).catch(() => null),
  { watch: [() => props.id] },
)

const list = computed(() => data.value?.list || null)
const accounts = computed(() => (data.value?.items || []).filter((item) => item.kind === 'account' && item.actor))

useHead({ title: computed(() => list.value?.name || 'List') })
</script>

<style scoped>
.listDescription,
.accountBio {
  white-space: pre-line;
  overflow-wrap: anywhere;
}
</style>
