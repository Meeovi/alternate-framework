<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    width="300"
    class="tasks-sidebar"
  >
    <v-toolbar flat>
      <v-toolbar-title>Tasks</v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-plus" @click="openCreateList" />
    </v-toolbar>

    <v-list nav dense>
      <!-- SMART LISTS -->
      <v-list-subheader>Smart Lists</v-list-subheader>

      <v-list-item
        prepend-icon="mdi-calendar-today"
        title="Today"
        @click="selectSmart('today')"
      />

      <v-list-item
        prepend-icon="mdi-calendar"
        title="Upcoming"
        @click="selectSmart('upcoming')"
      />

      <v-list-item
        prepend-icon="mdi-star"
        title="Starred"
        @click="selectSmart('starred')"
      />

      <v-divider class="my-4" />

      <!-- USER LISTS -->
      <v-list-subheader>Your Lists</v-list-subheader>

      <v-list-item
        v-for="list in lists"
        :key="list.id"
        :title="list.name"
        :prepend-icon="list.icon || 'mdi-format-list-bulleted'"
        @click="selectList(list)"
      >
        <template #append>
          <v-btn
            icon="mdi-dots-vertical"
            variant="text"
            @click.stop="openListMenu(list)"
          />
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- CREATE LIST DIALOG -->
  <v-dialog v-model="createDialog" max-width="400">
    <v-card>
      <v-card-title>Create List</v-card-title>
      <v-card-text>
        <v-text-field v-model="newList.name" label="List Name" />
        <v-select
          v-model="newList.type"
          :items="listTypes"
          label="List Type"
        />
        <v-text-field v-model="newList.icon" label="Icon (mdi-*)" />
        <v-color-picker v-model="newList.color" hide-canvas />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="createDialog = false">Cancel</v-btn>
        <v-btn color="primary" @click="create">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLists } from '@/layers/social/composables/useLists'

const drawer = ref(true)
const createDialog = ref(false)
const newList = ref({ name: '', type: 'basic', icon: '', color: '' })

const listTypes = [
  'basic',
  'todo',
  'shopping',
  'project',
  'habit'
]

const lists = ref([])

const { listLists, createList } = useLists()

onMounted(async () => {
  lists.value = await listLists({ sort: ['name'] })
})

const openCreateList = () => {
  newList.value = { name: '', type: 'basic', icon: '', color: '' }
  createDialog.value = true
}

const create = async () => {
  await createList(newList.value)
  lists.value = await listLists()
  createDialog.value = false
}

const selectList = (list) => {
  emit('select-list', list)
}

const selectSmart = (type) => {
  emit('select-smart', type)
}

const openListMenu = (list) => {
  emit('open-list-menu', list)
}
</script>

<style scoped>
.tasks-sidebar {
  border-right: 1px solid rgba(0,0,0,0.1);
}
</style>
