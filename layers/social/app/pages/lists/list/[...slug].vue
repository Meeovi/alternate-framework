<template>
  <div class="contentPage">
    <v-toolbar :color="list?.color || 'primary'" dark>
      <v-toolbar-title>{{ list?.name || 'List' }}</v-toolbar-title>
      <template #append>
        <LikeButton v-if="list?.id" target-type="list" :target-id="list.id" />
      </template>
    </v-toolbar>

    <div v-if="error" class="error pa-4">Failed to load list.</div>
    <div v-else-if="!list" class="pa-4">Loading...</div>

    <div v-else-if="list?.list_type?.list_type_id?.name === 'Checklist'" class="pa-4">
      <Grid :data="list.items || list" :autoConfig="true" />
    </div>

    <!-- Every other list type is rendered by a list-type plugin
         (packages/plugins/CMS-Content/list-type-*) registered in the
         app's nuxt.config.ts; each adds itself to appConfig.listTypes. -->
    <div v-else-if="listTypeEntry" class="pa-4">
      <component :is="listTypeEntry.component" :listId="list.id" :items="list.items" />
    </div>

    <v-alert v-else type="info" variant="tonal" class="ma-4">
      No list-type plugin is installed for "{{ listTypeName || 'this list' }}".
    </v-alert>
  </div>
</template>

<script setup>
  import {
    useRoute
  } from 'vue-router'
  import Grid from '#shared/app/components/ui/DataGrid/components/Grid.vue'
  import LikeButton from '../../../components/blocks/LikeButton.vue'

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
  }, {
    watch: [slug]
  })

  const list = computed(() => listRaw.value?.[0] || null)

  const appConfig = useAppConfig()
  const listTypeName = computed(() => list.value?.list_type?.list_type_id?.name)
  const listTypeEntry = computed(() => {
    const types = appConfig.listTypes || {}
    return types[listTypeName.value] || Object.values(types).find(t => t?.fallback) || null
  })

  const mediaItems = computed(() => {
    if (list.value?.type !== 'playlist') return []
    return list.value.items?.filter(item =>
      item.content.type === 'media' && ['audio', 'video'].includes(item.content.media_type)
    ).map(item => item.content) || []
  })

  const getListIcon = (type) => {
    const icons = {
      default: 'fas fa-list',
      playlist: 'fas fa-music',
      wishlist: 'fas fa-heart',
      bookmarks: 'fas fa-bookmark',
      tasks: 'fas fa-circle-check'
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
        middleware: 'auth'
    })
</script>