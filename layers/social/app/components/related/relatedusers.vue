<template>
    <div>
      <v-col cols="12">
        <v-toolbar density="comfortable" color="transparent">
            <v-toolbar-title>SUGGESTED USERS</v-toolbar-title>
        </v-toolbar>
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
            <v-slide-group-item v-for="user in users" :key="user.id" :value="user"
              v-slot="{ isSelected, toggle, selectedClass }">
              <userCard :member="user" :class="['ma-4', selectedClass]" v-if="isSelected" @click="toggle" />
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </div>
  </template>

  <script setup>
  import { ref } from '#imports'
import useContent from '#shared/app/composables/content/useContent'
  import userCard from '#social/app/components/related/memberList.vue'

  const model = ref(null)
 const { readItems } = useContent()

  const { data: users } = await useAsyncData('users', async () => {
    const resp = await readItems('tags')
    return resp?.data || resp || []
  })
</script>
