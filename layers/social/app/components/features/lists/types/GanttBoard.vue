<template>
    <Willow>
        <div class="gantt-wrap pa-2">
            <Gantt
                :tasks="tasks"
                :links="links"
                :scales="scales"
                :columns="columns"
                :init="init"
            />
        </div>
    </Willow>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import { Gantt, Willow, type ITask } from '@svar-ui/vue-gantt'
    import { useDirectusRequest } from '#social/composables/content/useDirectusRequest'

    // Directus collection: `gantt_tasks`
    //   id, text, start_date, end_date, duration, progress, parent, type,
    //   lazy, sort
    // Related collection: `gantt_links`
    //   id, source, target, type
    const COLLECTION = 'gantt_tasks'
    const LINKS = 'gantt_links'

    const { readItems, createItem, updateItem, deleteItem, readItem } = useDirectusRequest()

    const tasks = ref<any[]>([])
    const links = ref<any[]>([])

    const scales = [
        { unit: 'month', step: 1, format: '%F %Y' },
        { unit: 'day', step: 1, format: '%j, %D' },
    ]

    const columns = [
        { id: 'text', header: 'Task name', width: 200 },
        { id: 'start', header: 'Start', width: 100, type: 'date' },
        { id: 'duration', header: 'Duration', width: 80 },
        { id: 'progress', header: '%', width: 60, type: 'percent' },
    ]

    async function load() {
        const [taskRecords, linkRecords] = await Promise.all([
            readItems(COLLECTION, {
                fields: ['id', 'text', 'start_date', 'end_date', 'duration', 'progress', 'parent', 'type', 'lazy', 'sort'],
                sort: ['sort'],
                limit: -1,
            }) as Promise<any[]>,
            readItems(LINKS, {
                fields: ['id', 'source', 'target', 'type'],
                limit: -1,
            }) as Promise<any[]>,
        ])

        tasks.value = taskRecords.map((t) => ({
            id: t.id,
            text: t.text,
            start: t.start_date ? new Date(t.start_date) : new Date(),
            end: t.end_date ? new Date(t.end_date) : new Date(),
            duration: t.duration ?? 1,
            progress: t.progress ?? 0,
            parent: t.parent ?? 0,
            type: t.type ?? 'task',
            lazy: t.lazy ?? false,
        }))

        links.value = linkRecords.map((l) => ({
            id: l.id,
            source: l.source,
            target: l.target,
            type: l.type ?? 'e2e',
        }))
    }

    function init(api: any) {
        // Round-trip user edits to Directus.
        api.on('add-task', async ({ task }: { task: ITask }) => {
            const created = (await createItem(COLLECTION, {
                text: (task as any).text,
                start_date: new Date((task as any).start).toISOString(),
                end_date: new Date((task as any).end).toISOString(),
                duration: (task as any).duration ?? 1,
                progress: (task as any).progress ?? 0,
                parent: (task as any).parent ?? 0,
                type: (task as any).type ?? 'task',
            })) as any
            await load()
            // Re-assign the persisted id so future edits target the right row.
            api.exec('update-task', { id: (task as any).id, task: { id: created.id } })
        })

        api.on('update-task', async ({ id, task }: { id: string | number; task: ITask }) => {
            await updateItem(COLLECTION, id, {
                text: (task as any).text,
                start_date: new Date((task as any).start).toISOString(),
                end_date: new Date((task as any).end).toISOString(),
                duration: (task as any).duration,
                progress: (task as any).progress,
                parent: (task as any).parent,
                type: (task as any).type,
            })
            await load()
        })

        api.on('delete-task', async ({ id }: { id: string | number }) => {
            await deleteItem(COLLECTION, id)
            await load()
        })
    }

    onMounted(load)
</script>

<style>
    .gantt-wrap {
        height: 600px;
        width: 100%;
    }
</style>
