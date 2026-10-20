<template>
  <div class="contentPage">
    <v-toolbar :color="list?.color || 'primary'" dark>
      <v-toolbar-title>{{ list?.name || 'List' }}</v-toolbar-title>
      <template #append>
        <MeeoviRating v-if="list?.id" type="list" :id="list.id" />
      </template>
    </v-toolbar>

    <div v-if="error" class="error pa-4">Failed to load list.</div>
    <div v-else-if="!list && pending" class="pa-4">Loading...</div>
    <!-- Missing, or someone else's private list (the CMS proxy only returns private lists to their owner). -->
    <div v-else-if="!list" class="pa-4">This list doesn't exist or is private.</div>

    <!-- Wishlist: the products saved with the heart on product cards
         (#commerce stores/wishlist); un-hearting one removes it here. -->
    <div v-else-if="isWishlist" class="pa-4">
      <v-row v-if="wishlistProducts.length">
        <v-col v-for="product in wishlistProducts" :key="product.key" cols="12" sm="6" md="4" lg="3">
          <productCard :product="product" />
        </v-col>
      </v-row>
      <div v-else class="text-center text-medium-emphasis py-10">
        Nothing saved yet — tap the heart on any product to add it here.
      </div>
    </div>

    <div v-else-if="list?.list_type?.list_type_id?.name === 'Checklist'" class="pa-4">
      <Grid :data="list.items || list" :autoConfig="true" />
    </div>

    <!-- Every other list type is rendered by a list-type plugin
         (packages/plugins/CMS-Content/list-type-*) registered in the
         app's nuxt.config.ts; each adds itself to appConfig.listTypes. -->
    <div v-else-if="listTypeEntry" class="pa-4">
      <!-- A list type the viewer hasn't installed (Meeovi Workspace →
           Integrations) shows in the default view instead. -->
      <v-alert v-if="lockedListType" type="info" variant="tonal" class="mb-4"
        :text="`Install the ${lockedListType.label} integration to see this list as a ${lockedListType.label}.`">
        <template #append>
          <v-btn v-if="integrationsCatalog" :href="integrationsCatalog" variant="text" text="Get it" />
        </template>
      </v-alert>
      <!-- Sandboxed list types run isolated (@mframework/meeovi-integrations):
           they only get the capabilities they declare, for this list. -->
      <IntegrationFrame v-if="listTypeEntry.sandbox && integrationsApi" :plugin="listTypeEntry.plugin"
        :title="listTypeEntry.label" :context="{ list: { id: list.id, name: list.name } }"
        :capabilities="listCapabilities(listTypeEntry)" :min-height="320" />
      <component :is="listTypeEntry.component" v-else-if="listTypeEntry.component" :listId="list.id" :items="list.items" />
    </div>

    <v-alert v-else type="info" variant="tonal" class="ma-4">
      No list-type plugin is installed for "{{ listTypeName || 'this list' }}".
    </v-alert>

    <!-- Products saved with "Add to List": the site's own catalogue
         (lists_products) and commerce backends such as Magento
         (lists_backend_products). -->
    <section v-if="savedProducts.length && !isWishlist" class="pa-4">
      <h2 class="text-h6 mb-3">Saved products</h2>
      <v-row>
        <v-col v-for="product in savedProducts" :key="product.key" cols="12" sm="6" md="4" lg="3">
          <productCard :product="product" />
        </v-col>
      </v-row>
    </section>
  </div>
</template>

<script setup>
  import {
    useRoute
  } from 'vue-router'
  import Grid from '#ui/app/components/ui/DataGrid/components/Grid.vue'
  import productCard from '#commerce/app/components/catalog/product/productCard.vue'
  import { useWishlistStore } from '#commerce/app/stores/wishlist/useWishlistStore'
  import { productKey } from '#commerce/app/utils/productKey'

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
        'backend_products.*',
        'lists_type.lists_type_id.name',
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

  // A backend product's row keeps a snapshot; `source` + `sku` give
  // productCard its /product/<backend>:<sku> link and cart key.
  const savedProducts = computed(() => [
    ...(list.value?.products || [])
      .map((row) => row?.products_id)
      .filter((product) => product && typeof product === 'object')
      .map((product) => ({ ...product, key: `directus:${product.id}` })),
    ...(list.value?.backend_products || [])
      .filter((row) => typeof row?.product_key === 'string' && row.product_key.includes(':'))
      .map((row) => {
        const split = row.product_key.indexOf(':')
        return {
          key: row.product_key,
          id: row.backend_id || row.product_key,
          source: row.product_key.slice(0, split),
          sku: row.product_key.slice(split + 1),
          name: row.name,
          image: row.image,
          price: row.price,
        }
      }),
  ])

  // A list of type "Wishlist" (Directus lists_type) shows its products as a
  // grid instead of a list-type view.
  const isWishlist = computed(() => (list.value?.lists_type || []).some((row) => row?.lists_type_id?.name === 'Wishlist'))
  const wishlistStore = useWishlistStore()
  onMounted(() => { if (isWishlist.value) wishlistStore.load() })
  // Once the store knows the wishlist, a product un-hearted here disappears
  // without reloading the list (only for the viewer's own wishlist).
  const ownWishlist = computed(() => wishlistStore.loaded && wishlistStore.listSlug === list.value?.slug)
  const wishlistProducts = computed(() => (ownWishlist.value
    ? savedProducts.value.filter((product) => wishlistStore.hasItem(productKey(product)))
    : savedProducts.value))

  const appConfig = useAppConfig()
  const listTypeName = computed(() => list.value?.list_type?.list_type_id?.name)
  const fallbackListType = computed(() => Object.values(appConfig.listTypes || {}).find(t => t?.fallback) || null)

  // Per-user integrations (@mframework/meeovi-integrations, when the app
  // registers it): a list-type plugin only renders for viewers who
  // installed it. Fallback types (the default view) are always on.
  const runtimeConfig = useRuntimeConfig()
  const integrationsApi = runtimeConfig.public.meeoviIntegrations?.apiBase
  // The catalog lives in this app's /workspace (catalogPath) unless a full
  // URL to another app is configured.
  const integrationsCatalog = runtimeConfig.public.meeoviIntegrations?.catalogUrl
    || runtimeConfig.public.meeoviIntegrations?.catalogPath || null
  const requestFetch = useRequestFetch()
  const { data: installedIntegrations } = await useAsyncData('meeovi-integrations:installed',
    () => integrationsApi
      ? requestFetch(`${integrationsApi}/installed`).catch(() => ({ plugins: [], integrations: [] }))
      : Promise.resolve(null))

  const lockedListType = computed(() => {
    const entry = (appConfig.listTypes || {})[listTypeName.value]
    if (!entry || entry.fallback || !integrationsApi) return null
    return installedIntegrations.value?.plugins?.includes(entry.plugin) ? null : entry
  })

  const listTypeEntry = computed(() => {
    const entry = (appConfig.listTypes || {})[listTypeName.value]
    // A sandboxed type needs the integrations module to run it.
    if (entry && !lockedListType.value && (!entry.sandbox || integrationsApi)) return entry
    return fallbackListType.value
  })

  // ---- Capabilities lent to sandboxed list types --------------------------
  // Everything is scoped to the list on screen (list_id is forced, item ids
  // are checked against it) and limited to these fields; Directus access
  // still goes through the app's own client and its permission checks.
  const LIST_ITEMS = 'list_items'
  const ITEM_FIELDS = ['id', 'title', 'status', 'description', 'priority', 'due_date', 'position']
  const STATUSES = ['todo', 'doing', 'done']
  const { $createItem, $updateItem, $deleteItem } = useNuxtApp()

  const cleanItem = (input) => {
    const src = input && typeof input === 'object' ? input : {}
    const out = {}
    if ('title' in src) out.title = String(src.title ?? '').slice(0, 500) || 'Untitled'
    if ('description' in src) out.description = src.description == null ? null : String(src.description).slice(0, 5000)
    if ('status' in src) out.status = STATUSES.includes(src.status) ? src.status : 'todo'
    if ('priority' in src) out.priority = Math.min(3, Math.max(0, Math.round(Number(src.priority) || 0)))
    if ('position' in src) out.position = Math.max(0, Math.round(Number(src.position) || 0))
    if ('due_date' in src) {
      const d = src.due_date ? new Date(src.due_date) : null
      out.due_date = d && !Number.isNaN(d.getTime()) ? d.toISOString() : null
    }
    return out
  }

  const listItems = () => $directus.request($readItems(LIST_ITEMS, {
    fields: ITEM_FIELDS,
    filter: { list_id: { _eq: list.value.id } },
    sort: ['position'],
    limit: -1,
  }))

  const ownItem = async (id) => {
    const found = await $directus.request($readItems(LIST_ITEMS, {
      fields: ['id'],
      filter: { _and: [{ id: { _eq: id } }, { list_id: { _eq: list.value.id } }] },
      limit: 1,
    }))
    if (!found?.length) throw new Error('Not an item of this list')
  }

  const ALL_CAPABILITIES = {
    'list.items': () => listItems(),
    'list.create': async (item) => {
      await $directus.request($createItem(LIST_ITEMS, { ...cleanItem(item), list_id: list.value.id }))
      return listItems()
    },
    'list.update': async ({ id, changes } = {}) => {
      await ownItem(id)
      await $directus.request($updateItem(LIST_ITEMS, id, cleanItem(changes)))
      return listItems()
    },
    'list.remove': async ({ id } = {}) => {
      await ownItem(id)
      await $directus.request($deleteItem(LIST_ITEMS, id))
      return listItems()
    },
  }

  /** Only what the list type declared (read-only when it declares nothing). */
  const listCapabilities = (entry) => Object.fromEntries(
    (entry.capabilities?.length ? entry.capabilities : ['list.items'])
      .filter((name) => Object.hasOwn(ALL_CAPABILITIES, name))
      .map((name) => [name, ALL_CAPABILITIES[name]]))

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