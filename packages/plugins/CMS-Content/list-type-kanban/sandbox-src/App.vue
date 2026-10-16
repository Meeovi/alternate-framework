<template>
  <Willow :fonts="false">
    <p v-if="status" class="kanban__status">{{ status }}</p>
    <div v-else class="kanban">
      <Toolbar v-if="api" :api="api" :undo="false" :sort="true" :add="true" />
      <ContextMenu :api="api" :options="menuOptions">
        <Kanban
          :cards="cards"
          :columns="columns"
          :card="cardShape"
          :readonly="busy ? { edit: false, add: false, dnd: false } : false"
          :init="init"
        />
      </ContextMenu>
      <Editor v-if="api" :api="api" :items="editorItems" />
    </div>
  </Willow>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import {
  ContextMenu,
  Editor,
  Kanban,
  Toolbar,
  Willow,
  getCardShape,
  getEditorItems,
  getMenuOptions,
  type KanbanCard,
  type KanbanInstanceApi,
} from '@svar-ui/vue-kanban'

/**
 * Kanban board for a list, on SVAR Kanban, inside the integrations
 * sandbox. It never reaches the app or the network itself: everything goes
 * through the bridge (window.MeeoviSandbox, from __sdk.js) and the
 * capabilities the lists page lends it — list.items / list.create /
 * list.update / list.remove, scoped to the list on screen. Each of those
 * answers with the list's items afterwards, so the board re-renders from
 * the page's truth after every change.
 */

type Item = {
  id: string | number
  title?: string | null
  status?: string | null
  description?: string | null
  priority?: number | null
  due_date?: string | null
  position?: number | null
}

declare global {
  interface Window {
    MeeoviSandbox: {
      ready: Promise<unknown>
      call: (method: string, params?: unknown) => Promise<unknown>
      ui: { notify: (text: string) => void }
    }
  }
}

const bridge = () => window.MeeoviSandbox

// Board stages; each id is the list item's `status`.
const columns = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'In progress' },
  { id: 'done', label: 'Done' },
]
const COLUMN_IDS = new Set(columns.map((c) => c.id))

// Duplicating isn't a list operation the page lends, so it's left out.
const menuOptions = getMenuOptions().filter((o: { id?: string }) => o.id !== 'duplicate-card')

// What list items can hold (the page whitelists fields and values).
const cardShape = {
  ...getCardShape(),
  priority: true,
  deadline: { format: '%M %d, %Y' },
  description: true,
  progress: false,
  users: false,
  tags: false,
  attachments: false,
  comments: false,
  cover: false,
  menu: { options: menuOptions },
}
const editorItems = getEditorItems(cardShape)

const cards = shallowRef<KanbanCard[]>([])
const api = shallowRef<KanbanInstanceApi | null>(null)
const status = ref('Loading…')
const busy = ref(false)

const toCard = (item: Item): KanbanCard => ({
  id: item.id,
  label: item.title || 'Untitled',
  column: COLUMN_IDS.has(item.status ?? '') ? item.status! : 'todo',
  description: item.description ?? '',
  // SVAR priorities: 1 Low, 2 Medium, 3 High (same as list items); 0 = none.
  priority: item.priority || undefined,
  deadline: item.due_date ? new Date(item.due_date) : undefined,
  position: item.position ?? 0,
})

function show(items: unknown) {
  const list = Array.isArray(items) ? (items as Item[]) : []
  cards.value = list
    .map(toCard)
    .sort((a, b) => (a.position as number) - (b.position as number))
}

const changes = (card: KanbanCard) => ({
  title: String(card.label ?? '').trim() || 'Untitled',
  description: card.description || null,
  priority: Number(card.priority) || 0,
  due_date: card.deadline ? new Date(card.deadline as Date).toISOString() : null,
})

const inColumn = (column: string) => cards.value.filter((c) => c.column === column).length

/** Run one capability; the board then shows the page's items. */
async function act(method: string, params: unknown) {
  busy.value = true
  try {
    show(await bridge().call(method, params))
  } catch {
    bridge().ui.notify('Could not save the board. Please try again.')
    show(await bridge().call('list.items').catch(() => []))
  } finally {
    busy.value = false
  }
}

function init(instance: KanbanInstanceApi) {
  api.value = instance

  instance.on('add-card', ({ card, columnId }: { card?: KanbanCard, columnId?: string }) => {
    const column = String(card?.column ?? columnId ?? 'todo')
    act('list.create', {
      ...changes(card ?? {}),
      status: COLUMN_IDS.has(column) ? column : 'todo',
      position: inColumn(column),
    })
  })

  instance.on('update-card', ({ id, card }: { id: string | number, card: KanbanCard }) => {
    act('list.update', { id, changes: changes(card) })
  })

  instance.on('move-card', ({ id, columnId, card }: { id: string | number, columnId?: string, card?: KanbanCard }) => {
    const column = String(columnId ?? card?.column ?? 'todo')
    act('list.update', { id, changes: { status: COLUMN_IDS.has(column) ? column : 'todo', position: inColumn(column) } })
  })

  instance.on('delete-card', ({ id }: { id: string | number }) => {
    act('list.remove', { id })
  })
}

onMounted(async () => {
  try {
    await bridge().ready
    show(await bridge().call('list.items'))
    status.value = ''
  } catch {
    status.value = 'This board couldn\'t be loaded.'
  }
})
</script>

<style>
html, body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  background: transparent;
}

.kanban {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 420px;
}

.kanban .wx-kanban {
  height: 480px;
}

.kanban__status {
  padding: 16px;
  color: #555;
}
</style>
