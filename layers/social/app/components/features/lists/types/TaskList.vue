<template>
    <Tasklist
        :value="list as any"
        :ondata="loadItems"
        :onchange="onChange"
        :readonly="readonly"
    />
</template>

<script setup lang="ts">
    import { Tasklist, type ITask, type IChange } from '@svar-ui/vue-tasklist'

    const props = defineProps({
        list: {
            type: [String, Number],
            required: true,
        },
        items: {
            type: Array,
            default: () => [],
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    })

    const { readItems, createItem, updateItem, deleteItem } = useNuxtApp() as any
    const COLLECTION = 'list_items'

    // SVAR Tasklist asks for the data of the list identified by `value`.
    async function loadItems(listId: string | number): Promise<ITask[]> {
        const records = (await readItems(COLLECTION, {
            fields: ['id', 'content', 'status', 'list'],
            filter: { list: { _eq: listId } },
            sort: ['sort'],
            limit: -1,
        })) as Array<{ id: string | number; content?: string; title?: string; status?: number }>

        return records.map((r) => ({
            id: r.id,
            content: r.content ?? r.title ?? '',
            status: r.status ?? 0,
        }))
    }

    // Persist any add/update/delete the user makes back to Directus.
    async function onChange({ action, id, task }: IChange) {
        if (action === 'add' && task) {
            await createItem(COLLECTION, {
                list: props.list,
                content: task.content,
                status: task.status ?? 0,
            })
        } else if (action === 'update' && id != null) {
            await updateItem(COLLECTION, id, {
                content: task?.content,
                status: task?.status ?? 0,
            })
        } else if (action === 'delete' && id != null) {
            await deleteItem(COLLECTION, id)
        }
    }
</script>
