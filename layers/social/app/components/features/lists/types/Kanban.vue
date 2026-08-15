<template>
  <ClientOnly>
    <Willow>
      <div class="kanban-wrap pa-2">
        <ContextMenu :api="api" :options="menuOptions" :onclick="onMenuClick">
          <Kanban
            :cards="cards"
            :columns="columns"
            :columnAccessor="columnAccessor"
            :card="cardShape"
            :cardCss="cardCss"
            :init="init"
          />
        </ContextMenu>

        <Toolbar v-if="api" :api="api" :undo="true" :sort="true" :add="true" />
        <Editor v-if="api" :api="api" :items="editorItems" />
      </div>
    </Willow>
    <template #fallback>
      <div class="pa-4">Loading kanban...</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import {
    Kanban,
    Editor,
    ContextMenu,
    Toolbar,
    Willow,
    getCardShape,
    getEditorItems,
    getMenuOptions,
    type KanbanCard,
  } from '@svar-ui/vue-kanban'
  import { useDirectusRequest } from '#social/composables/content/useDirectusRequest'

  const props = defineProps({
    listId: { type: [String, Number], required: true },
  })

  const COLLECTION = 'list_items'
  // useNuxtApp() exposes $readItems/$createItem/etc (dollar-prefixed) — the
  // bare, unprefixed names destructured here were always undefined, so the
  // board never loaded and every CRUD handler below threw.
  const { readItems, createItem, updateItem, deleteItem } = useDirectusRequest()

  // Board stages. Each `id` maps to the Directus `list_items.status` value
  // via `columnAccessor` below.
  const columns = [
    { id: 'todo', label: 'To Do', addCard: true },
    { id: 'doing', label: 'In Progress', addCard: true },
    { id: 'done', label: 'Done', addCard: true },
  ]
  const columnAccessor = 'status'

  // Enable the full set of card features.
  const cardShape = {
    ...getCardShape(),
    priority: true,
    progress: { showLabel: true },
    deadline: { format: '%M %d, %Y' },
    tags: true,
    description: true,
    comments: false,
    attachments: false,
    users: true,
    menu: true,
  }

  const cards = ref<KanbanCard[]>([])
  const api = ref<any>(null)

  // Editor fields (priority, progress, deadline, tags, users, description).
  const editorItems = getEditorItems()

  const menuOptions = getMenuOptions()

  // ---- Directus <-> Kanban mapping ----------------------------------------

  async function load() {
    // Field names below are the real list_items columns — the previous
    // list (content/list/sort/deadline/progress) didn't match the live
    // schema at all (real names: title/list_id/position/due_date, and
    // there's no progress column). filter: { list: ... } in particular
    // referenced a column that doesn't exist, which errors on Directus's
    // side rather than just coming back empty, so this never loaded.
    const records = (await readItems(COLLECTION, {
      fields: [
        'id',
        'title',
        'status',
        'description',
        'priority',
        'due_date',
        'position',
      ],
      filter: { list_id: { _eq: props.listId } },
      sort: ['position'],
      limit: -1,
    })) as Array<Record<string, any>>

    cards.value = records.map((r) => ({
      id: r.id,
      label: r.title ?? 'Untitled',
      column: r.status ?? 'todo',
      description: r.description ?? '',
      priority: r.priority ?? 0,
      deadline: r.due_date ? new Date(r.due_date) : undefined,
    }))
  }

  function toRecord(card: any) {
    return {
      list_id: props.listId,
      title: card.label ?? 'Untitled',
      status: card.column ?? 'todo',
      description: card.description ?? null,
      priority: card.priority ?? 0,
      due_date: card.deadline ? new Date(card.deadline).toISOString() : null,
    }
  }

  // ---- Instance API lifecycle ---------------------------------------------

  function init(a: any) {
    api.value = a

    a.on('add-card', async ({ card }: any) => {
      await createItem(COLLECTION, toRecord(card))
      await load()
    })

    a.on('update-card', async ({ id, card }: any) => {
      await updateItem(COLLECTION, id, toRecord(card))
      await load()
    })

    a.on('move-card', async ({ id, card }: any) => {
      // Move = column change; persist status and sort order.
      await updateItem(COLLECTION, id, {
        status: card.column ?? 'todo',
        sort: card.order ?? 0,
      })
      await load()
    })

    a.on('delete-card', async ({ id }: any) => {
      await deleteItem(COLLECTION, id)
      await load()
    })
  }

  function onMenuClick({ action, context }: any) {
    if (api.value && action?.id === 'duplicate' && context?.id != null) {
      api.value.exec('add-card', { card: { ...context, id: undefined } })
    }
  }

  function cardCss(card: any) {
    const p = card?.priority
    if (p === 3) return 'k-card--high'
    if (p === 1) return 'k-card--low'
    return ''
  }

  onMounted(load)
  onBeforeUnmount(() => {
    if (api.value) {
      api.value.detach('add-card')
      api.value.detach('update-card')
      api.value.detach('move-card')
      api.value.detach('delete-card')
    }
  })
</script>

<style>
  .kanban-wrap {
    height: 100%;
    min-height: 480px;
  }
  .k-card--high {
    border-left: 3px solid #ef4444;
  }
  .k-card--low {
    border-left: 3px solid #22c55e;
  }
</style>
