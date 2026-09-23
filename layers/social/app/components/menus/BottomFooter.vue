<template>
  <ClientOnly>
    <div
      v-if="session.data?.user"
      class="pa-4 text-center feedButton"
    >
      <v-dialog
        v-model="dialog"
        max-width="800"
        transition="dialog-bottom-transition"
      >
        <template #activator="{ props }">
          <v-btn
            icon="fas fa-pen-to-square"
            class="postbtn"
            title="Post to Social Feed"
            v-bind="props"
          />
        </template>

        <template #default="{ isActive }">
          <v-card class="pa-4">
            <AddPost v-if="dialog" />

            <v-card-actions>
              <v-spacer />

              <v-btn
                text="Close"
                variant="text"
                @click="isActive.value = false"
              />
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
    </div>
  </ClientOnly>
</template>

<script setup>
import {
  defineAsyncComponent,
  ref
} from 'vue'
import { authClient } from '#auth/lib/auth-client'

const AddPost = defineAsyncComponent(() => import('../features/feed/add-post.vue'))

// authClient.useSession() returns the Vue ref itself (readonly(shallowRef)
// from better-auth's vue-store.mjs) — its .value is the {data, error,
// isPending, isRefetching, refetch} shape. Destructuring `data` straight
// off the returned ref (as several other components in this repo also
// did) always yields undefined; the check has to go through
// session.data (template auto-unwraps the top-level ref) or
// session.value.data (from script code).
const session = authClient.useSession()

const dialog = ref(false)
</script>
