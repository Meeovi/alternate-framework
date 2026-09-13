<template>
  <div
    v-if="session?.user"
    class="pa-4 text-center feedButton"
  >
    <v-dialog
      v-model="dialog"
      max-width="800"
      transition="dialog-bottom-transition"
    >
      <template #activator="{ props }">
        <v-btn
          icon="fas fa-plus"
          class="postbtn"
          title="Post to Social Feed"
          v-bind="props"
        />
      </template>

      <template #default="{ isActive }">
        <v-card class="pa-4">
          <ClientOnly>
            <AddPost v-if="dialog" />
          </ClientOnly>

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
</template>

<script setup>
import {
  defineAsyncComponent,
  ref
} from 'vue'
import { authClient } from '#auth/lib/auth-client'

const AddPost = defineAsyncComponent(() => import('../features/feed/add-post.vue'))

const { data: session } = authClient.useSession()

const dialog = ref(false)
</script>
