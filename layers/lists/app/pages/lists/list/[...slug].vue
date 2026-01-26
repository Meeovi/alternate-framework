<template>
  <v-container fluid>
    <div v-if="pending" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="error" class="text-center py-8">
      <v-alert type="error">Failed to load list</v-alert>
    </div>

    <div v-else-if="list">
      <!-- List Header -->
      <v-toolbar :color="getListColor(list.type)" extended>
        <v-toolbar-title>{{ list.name }}</v-toolbar-title>

        <template v-slot:extension>
          <p v-dompurify-html="list?.description"></p>
        </template>

        <v-chip>{{ list?.type }}</v-chip>
        <v-chip :color="list?.status === 'public' ? 'success' : 'default'" class="ml-3" variant="outlined">
          {{ list?.status }}
        </v-chip>

        <v-btn color="primary" prepend-icon="fas fa-plus" @click="showAddDialog = true">
          Add Item
        </v-btn>

        <!-- List Items -->
        <addList />
      </v-toolbar>
    </div>

    <!-- Add Item Dialog -->
    <listItem v-model="showAddDialog" :list-type="list?.type" :list-id="list?.id" @added="refreshList" />

    <section data-bs-version="5.1" class="mbr-section features20 cid-txNnCwzel4" id="features20-4t"
      data-sortbtn="btn-primary">
      <div class="container-fluid">
        <h2 class="mbr-section-title text-center mbr-fonts-style display-5 auto-text">
          Items in this {{ list?.type }}</h2>
        <div class="underline align-center pb-3">
          <div class="line"></div>
        </div>

        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="pa-4" show-arrows v-if="list?.products?.length">
            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
              v-for="(products, index) in list?.products" :key="index">
              <productCard :product="products?.products_id" :class="['ma-4', selectedClass]" @click="toggle" />

              <div class="d-flex fill-height align-center justify-center">
                <v-scale-transition>
                  <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
                </v-scale-transition>
              </div>
            </v-slide-group-item>
          </v-slide-group>

          <v-slide-group v-model="model" class="pa-4" show-arrows v-else-if="list?.spaces?.length">
            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="(spaces, index) in list?.spaces"
              :key="index">
              <spaceCard :space="spaces" :class="['ma-4', selectedClass]" @click="toggle" />

              <div class="d-flex fill-height align-center justify-center">
                <v-scale-transition>
                  <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
                </v-scale-transition>
              </div>
            </v-slide-group-item>
          </v-slide-group>

          <v-slide-group v-model="model" class="pa-4" show-arrows v-else-if="list?.shorts?.length">
            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="(shorts, index) in list?.shorts"
              :key="index">
              <shortCard :short="shorts?.shorts_id" :class="['ma-4', selectedClass]" @click="toggle" />

              <div class="d-flex fill-height align-center justify-center">
                <v-scale-transition>
                  <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
                </v-scale-transition>
              </div>
            </v-slide-group-item>
          </v-slide-group>

          <div v-else class="text-center py-8">
            <p>No items in this {{ list?.type }}</p>
          </div>
        </v-sheet>
      </div>
    </section>

    
  </v-container>
</template>

<script setup>
  import {
    ref,
    computed
  } from 'vue'
  import {
    useRoute
  } from 'vue-router'
  import {
    useLists
  } from '@/composables/lists/useLists'
  import listItem from '@/components/lists/add-list-item.vue'
  import addList from '@/components/lists/add-list.vue'
  import productCard from '#commerce/app/components/catalog/product/productCard.vue'
  import spaceCard from '#social/app/components/related/space.vue'
  import shortCard from '#social/app/components/related/short.vue'

  const route = useRoute()
  const {
    updateListItem,
    removeFromList
  } = useLists()

  const showAddDialog = ref(false)

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
    return $directus.request(
      $readItems('lists', {
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
      })
    )
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