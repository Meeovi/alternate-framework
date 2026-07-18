<template>
  <div>
    <v-toolbar :color="list?.color || 'primary'" dark>
      <v-toolbar-title>{{ list?.name || 'List' }}</v-toolbar-title>
    </v-toolbar>

    <div v-if="error" class="error pa-4">Failed to load list.</div>
    <div v-else-if="!list" class="pa-4">Loading...</div>

    <div v-else-if="list?.type === 'Default'" class="pa-4">
      <Grid :data="list.items || list" :autoConfig="true" />
    </div>

    <div v-else-if="list?.type === 'Board'" class="pa-4">
      <TaskBoard :listId="list.id" :items="list.items" />
    </div>

    <div v-else-if="list?.type === 'Checklist'" class="pa-4">
      <TaskList :listId="list.id" :items="list.items" />
    </div> 
    
    <div v-else-if="list?.type === 'Kanban'" class="pa-4">
      <KanbanProjectBoard :listId="list.id" :items="list.items" />
    </div>  

    <div v-else-if="list?.type === 'Habit Tracker'" class="pa-4">
      <HabitTrackerVIew :listId="list.id" :items="list.items" />
    </div> 

    <div v-else class="pa-4">
      <p style="text-align: center; width: 100%; padding-top: 25%;">List Not Found.</p>
    </div>
  </div>
</template>

<script setup>
  import {
    useRoute
  } from 'vue-router'
  import Grid from '../../../../../shared/app/components/ui/DataGrid/components/Grid.vue'
  import { TaskBoard } from '../../../components/features/lists/types/TaskBoard.vue'
  import { KanbanProjectBoard } from '../../../components/features/lists/types/Kanban.vue/index.js'
  import { TaskList } from '../../../components/features/lists/types/TaskList.vue'
import HabitTrackerVIew from '../../../components/features/lists/types/HabitTrackerVIew.vue'

  const route = useRoute();
  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const slug = computed(() => {
    const s = route.params.slug
    return Array.isArray(s) ? s[0] : s
  })

  const {
    data: listRaw,
    pending,
    error,
    refresh: refreshList
  } = await useAsyncData('list', () => {
    return $directus.request($readItems('lists', {
      fields: [
        '*',
        'category.categories_id.*',
        'department.departments_id',
        'spaces.spaces_id.*',
        'products.products_id.*',
        'products.products_id.image.*',
        'vibez.shorts_id.*',
        'list_template.templates.*',
        'image.*',
        'media.*',
        'list_items.list_items_id.*',
        'list_products.list_products_id.*',
        'user.directus_users.*'
      ],
      filter: {
        slug: {
          _eq: slug.value
        }
      },
      limit: 1
    }))
  })

  const list = computed(() => listRaw.value?.[0] || null)

  const mediaItems = computed(() => {
    if (list.value?.type !== 'playlist') return []
    return list.value.items?.filter(item =>
      item.content.type === 'media' && ['audio', 'video'].includes(item.content.media_type)
    ).map(item => item.content) || []
  })

  const getListIcon = (type) => {
    const icons = {
      default: 'mdi-format-list-bulleted',
      playlist: 'mdi-playlist-music',
      wishlist: 'mdi-heart',
      bookmarks: 'mdi-bookmark',
      tasks: 'mdi-check-circle'
    }
    return icons[type] || icons.default
  }

  const getListColor = (type) => {
    const colors = {
      default: 'primary',
      playlist: 'purple',
      wishlist: 'pink',
      bookmarks: 'orange',
      tasks: 'green'
    }
    return colors[type] || colors.default
  }

  const updateTask = async (itemId, taskData) => {
    try {
      await updateListItem(itemId, {
        content: taskData
      })
      await refreshList()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const editItem = (item) => {
    // Handle edit functionality
    console.log('Edit item:', item)
  }

  const duplicateItem = (item) => {
    // Handle duplicate functionality
    console.log('Duplicate item:', item)
  }

  const deleteItem = async (itemId) => {
    try {
      await removeFromList(itemId)
      await refreshList()
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  useHead({
    title: computed(() => list.value?.name || 'List')
  })

  definePageMeta({
    //middleware: ['authenticated']
  })
</script>