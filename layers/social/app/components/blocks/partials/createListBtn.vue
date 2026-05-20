<template>
  <div>
    <v-dialog v-model="dialogOpen" justify="center">
      <template v-slot:activator="{ props }">
        <v-btn size="m" variant="tertiary" v-bind="props">
          <SfIconFavorite size="m" />
          Add to list
        </v-btn>
      </template>

      <v-card max-width="500px">
        <v-tabs v-model="tab" bg-color="info">
          <v-tab value="one">Your Lists</v-tab>
          <!--<v-tab value="two">Create a List</v-tab>
          <v-tab value="three">Item Three</v-tab>-->
        </v-tabs>

        <template>
          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="one">
              <v-row>
                <v-col cols="12" v-for="list in lists" :key="list.id">
                  <strong>
                    <p style="text-align: center;">Save</p>
                  </strong>
                  <v-list lines="two">
                        <v-list-item :title="list?.name" :subtitle="list?.type"
                          :prepend-avatar="content.getAssetUrl(list?.image)"
                      @click="saveProductToList(list.id)" style="cursor: pointer;" :disabled="loading">
                      <template v-slot:append>
                        <v-progress-circular v-if="loading" indeterminate size="24"></v-progress-circular>
                        <v-icon v-else icon="fas:fa fa-plus"></v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>

              <createlist />
            </v-tabs-window-item>

            <v-tabs-window-item value="two">
            </v-tabs-window-item>

            <v-tabs-window-item value="three">
              Three
            </v-tabs-window-item>
          </v-tabs-window>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from '#imports'

const content = useSdkContentAdapter()

const { data: lists } = await useAsyncData('lists', async () => {
  const opts = { filter: { status: { _eq: 'Public' } } }
  const resp = await content.readItems('lists', opts)
  return resp?.data || resp
})

const loading = ref(false)

const saveProductToList = async (listId) => {
  loading.value = true
  try {
    // Payload can be extended by caller context when available.
    await content.createItem('list_items', { list: listId })
  } catch (err) {
    console.error('Failed to save product to list', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
  .v-dialog {
    border-radius: 8px;
  }
</style>