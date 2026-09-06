<template>
  <div class="d-inline-block">
    <v-btn
      class="relative"
      :prepend-icon="hasAnyList ? 'fas fa-bookmark' : 'fas fa-list'"
      :color="hasAnyList ? 'primary' : undefined"
      variant="outlined"
      @click.stop="drawer = !drawer"
      aria-label="Add to list"
    >
      Add to List
    </v-btn>

    <v-snackbar v-model="confirmation" timeout="2000" color="success">
      {{ confirmationMessage }}
    </v-snackbar>

    <!-- Flyout Menu -->
    <v-navigation-drawer v-model="drawer" location="right" temporary class="add-to-list-flyout">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Add to List</span>
        <v-btn icon="fas fa-x" @click="drawer = false"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <div v-if="item" class="product-preview d-flex align-center pa-4">
        <v-img
          :src="item.image || '/images/placeholder.png'"
          width="56"
          height="56"
          cover
          class="rounded mr-3 flex-none"
        />
        <div>
          <div class="text-subtitle-2">{{ item.name }}</div>
          <!-- item.price is already a fully-formatted string (e.g.
               "$12.00") where it's supplied — don't prefix another $. -->
          <div v-if="item.price" class="text-caption text-grey">{{ item.price }}</div>
        </div>
      </div>

      <v-divider></v-divider>

      <!-- Create a new list right from the panel -->
      <div class="pa-4">
        <v-form @submit.prevent="handleCreateList">
          <v-text-field
            v-model="newListName"
            label="Create a new list"
            placeholder="e.g. Birthday ideas"
            density="compact"
            hide-details="auto"
            :disabled="creating"
            :loading="creating"
            append-inner-icon="fas fa-plus"
            @click:append-inner="handleCreateList"
          />
        </v-form>
      </div>

      <v-divider></v-divider>

      <!-- The user's current lists -->
      <div class="lists-items">
        <template v-if="loadingLists">
          <v-progress-circular indeterminate color="primary" class="ma-4"></v-progress-circular>
        </template>
        <template v-else-if="lists.length">
          <v-list lines="two">
            <v-list-item
              v-for="list in lists"
              :key="list.id"
              :title="list.name"
              :subtitle="listTypeLabel(list.type)"
              class="list-row"
              :disabled="pendingListIds.has(list.id)"
              @click="toggleList(list)"
            >
              <template #prepend>
                <v-avatar :color="list.color || 'primary'" size="36">
                  <v-icon :icon="list.icon || 'fas fa-list'" color="white" size="small"></v-icon>
                </v-avatar>
              </template>
              <template #append>
                <v-progress-circular v-if="pendingListIds.has(list.id)" indeterminate size="20"></v-progress-circular>
                <v-icon v-else-if="isInList(list.id)" icon="fas fa-check" color="success"></v-icon>
                <v-icon v-else icon="fas fa-plus"></v-icon>
              </template>
            </v-list-item>
          </v-list>
        </template>
        <template v-else>
          <v-alert type="info" class="mt-4 mx-4">
            You don't have any lists yet — create one above.
          </v-alert>
        </template>

        <v-alert v-if="error" type="error" class="mt-4 mx-4">{{ error }}</v-alert>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useLists, listTypeRegistry, type SavedListItemKind } from '../../../composables/lists/useLists'

type SavableListItem = {
  id: string | number
  name?: string
  image?: string
  price?: number | string
}

const props = withDefaults(defineProps<{
  item: SavableListItem
  // What kind of thing `item` is — a product, a space, or a vibe (short).
  // Determines which junction table the panel reads/writes on the server
  // (see server/utils/listItemKinds.ts) — place this button wherever one
  // of those is shown, with the matching `kind`.
  kind?: SavedListItemKind
}>(), {
  kind: 'product',
})

const {
  listLists,
  createList,
  getListsContainingItem,
  addItemToList,
  removeItemFromList,
} = useLists()

const drawer = ref(false)
const lists = ref<any[]>([])
const listIdsWithItem = ref<Set<string | number>>(new Set())
const pendingListIds = ref<Set<string | number>>(new Set())
const loadingLists = ref(false)
const creating = ref(false)
const newListName = ref('')
const error = ref<string | null>(null)
const confirmation = ref(false)
const confirmationMessage = ref('')

const hasAnyList = computed(() => listIdsWithItem.value.size > 0)

const listTypeLabel = (type: string) => listTypeRegistry[type]?.label || type

const showConfirmation = (message: string) => {
  confirmationMessage.value = message
  confirmation.value = true
}

// Just the membership check — cheap, and lets the trigger button reflect
// "already saved" state before the panel is ever opened.
const loadMembership = async () => {
  if (!props.item?.id) return
  try {
    const containing = await getListsContainingItem(props.kind, props.item.id)
    listIdsWithItem.value = new Set(containing)
  } catch (err) {
    // Non-fatal — the button just won't show the "saved" state yet; the
    // panel's own load (on open) will surface a real error if it persists.
    console.error('Failed to check list membership', err)
  }
}

// Full load: the user's lists plus which of them already contain this
// item — run whenever the panel is opened, so it's never stale.
const loadPanel = async () => {
  if (!props.item?.id) return
  loadingLists.value = true
  error.value = null
  try {
    const [listsResult, containing] = await Promise.all([
      listLists(),
      getListsContainingItem(props.kind, props.item.id),
    ])
    lists.value = listsResult
    listIdsWithItem.value = new Set(containing)
  } catch (err) {
    console.error('Failed to load lists', err)
    error.value = 'Failed to load your lists. Please try again.'
  } finally {
    loadingLists.value = false
  }
}

onMounted(loadMembership)

watch(drawer, (open) => {
  if (open) loadPanel()
})

const isInList = (listId: string | number) => listIdsWithItem.value.has(listId)

const toggleList = async (list: any) => {
  if (!props.item?.id || pendingListIds.value.has(list.id)) return

  pendingListIds.value = new Set(pendingListIds.value).add(list.id)
  error.value = null

  try {
    if (isInList(list.id)) {
      await removeItemFromList(props.kind, list.id, props.item.id)
      const next = new Set(listIdsWithItem.value)
      next.delete(list.id)
      listIdsWithItem.value = next
      showConfirmation(`Removed from "${list.name}"`)
    } else {
      await addItemToList(props.kind, list.id, props.item.id)
      listIdsWithItem.value = new Set(listIdsWithItem.value).add(list.id)
      showConfirmation(`Added to "${list.name}"`)
    }
  } catch (err) {
    console.error('Failed to update list', err)
    error.value = 'Failed to update that list. Please try again.'
  } finally {
    const next = new Set(pendingListIds.value)
    next.delete(list.id)
    pendingListIds.value = next
  }
}

const handleCreateList = async () => {
  const name = newListName.value.trim()
  if (!name || creating.value) return

  creating.value = true
  error.value = null

  try {
    const created = await createList({ name })
    if (created) {
      lists.value = [...lists.value, created]
      newListName.value = ''
      // A list you just made for this item should already contain it.
      await toggleList(created)
    }
  } catch (err) {
    console.error('Failed to create list', err)
    error.value = 'Failed to create the list. Please try again.'
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
  .add-to-list-flyout {
    width: 400px;
  }

  .lists-items {
    padding-bottom: 16px;
  }

  .list-row {
    cursor: pointer;
  }

  .product-preview .v-img {
    border-radius: 4px;
  }
</style>
