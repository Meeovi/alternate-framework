<template>
  <div>
    <v-toolbar :color="friendPurchasesBar?.color">
      <v-toolbar-title>{{ friendPurchasesBar?.name || 'Your Friends' }}</v-toolbar-title>
    </v-toolbar>

    <v-container>
      <div
        v-if="pending"
        class="py-12 text-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>

      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
      >
        Couldn’t load what your friends are shopping for. Please try again later.
      </v-alert>

      <div
        v-else-if="!friends.length"
        class="py-12 text-center text-medium-emphasis"
      >
        <v-icon
          icon="fas fa-user-group"
          size="x-large"
          class="mb-3"
        />
        <p>None of the people you follow are shopping for anything right now.</p>
      </div>

      <section
        v-for="friend in friends"
        :key="friend.id"
        class="mb-10"
      >
        <div class="d-flex align-center mb-4">
          <v-avatar
            color="surface-variant"
            size="40"
            class="mr-3"
          >
            <span>{{ initials(friend.name) }}</span>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-medium">
              {{ friend.name }}
            </div>
            <div class="text-caption text-medium-emphasis">
              shopping for {{ friend.items.length }}
              {{ friend.items.length === 1 ? 'item' : 'items' }}
            </div>
          </div>
        </div>

        <v-row>
          <v-col
            v-for="item in friend.items"
            :key="item.key"
            cols="6"
            sm="4"
            md="3"
          >
            <productCard :product="item.product" />
            <div
              v-if="item.quantity > 1"
              class="text-caption text-medium-emphasis mt-1"
            >
              Wants {{ item.quantity }}
            </div>
          </v-col>
        </v-row>
      </section>
    </v-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import productCard from '../components/catalog/product/productCard.vue'

const {
  $directus,
  $readItem
} = useNuxtApp()

// useFetch (not $fetch) so the viewer's session cookie is forwarded on
// the SSR request — the endpoint is auth-gated (requireAuth).
const {
  data: shopping,
  pending,
  error
} = await useFetch('/api/commerce/friends/shopping')

const friends = computed(() => shopping.value?.friends ?? [])

const {
  data: friendPurchasesBar
} = await useAsyncData('friendPurchasesBar', () => {
  return $directus.request($readItem('navigation', '126', {
    fields: ['*', {
      '*': ['*']
    }]
  }))
})

function initials(name) {
  return String(name || '?')
    .split(/\s+/)
    .map(word => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

useHead({
  title: computed(() => friendPurchasesBar?.value?.name || 'Your Friends')
})
</script>
