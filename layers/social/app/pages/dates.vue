<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>{{ dateBarName }}</v-toolbar-title>
        </v-toolbar>
        <Willow>
            <div class="calendar-wrap pa-4">
                <ContextMenu :api="api" :options="menuOptions" :onclick="onMenuClick">
                    <Calendar :init="init" :events="events" :views="['day', 'week', 'month', 'agenda', 'year']"
                        view="week" recurring :cellClass="cellClass" :eventClass="eventClass" :toolbar="toolbar"
                        :onaction="onToolbarAction">
                        <CalendarPanel :calendars="groupOptions" accessor="calendarId" />
                    </Calendar>
                </ContextMenu>

                <Editor v-if="api" :api="api" />

                <!-- Hidden file input for iCal import -->
                <input ref="fileInput" type="file" accept=".ics,text/calendar" class="d-none" @change="onFilePicked" />
            </div>
        </Willow>
    </div>
</template>

<script setup lang="ts">
    import {
        ref,
        onMounted,
        onBeforeUnmount
    } from 'vue'
    import {
        Calendar,
        Editor,
        ContextMenu,
        Willow,
        CalendarPanel,
        getMenuOptions,
        getToolbarItems,
        parseICal,
        serializeICal,
    } from '@svar-ui/vue-calendar'

    import {
        useCalendar,
        type CalendarEventRecord,
        type CalendarGroupRecord
    } from '../composables/calendar/useCalendar'

    const {
        fetchEvents,
        fetchGroups,
        createEvent,
        updateEvent,
        deleteEvent
    } = useCalendar()
    const { $directus, $readItem } = useNuxtApp() as any

    type SvarEvent = {
        id: string | number
        start: Date
        end: Date
        text: string
        allDay?: boolean
        rrule?: string
        masterEventId?: string | number
        originalDate?: string
        calendarId?: string
        description?: string
        status?: string
        [key: string]: any
    }

    const api = ref < any > (null)
    const events = ref < SvarEvent[] > ([])
    const fileInput = ref < HTMLInputElement | null > (null)

    // Calendar groups drive the filtering sidebar (CalendarPanel).
    const groups = ref < CalendarGroupRecord[] > ([])

    const groupOptions = ref < {
        id: string;label: string;active ? : boolean;css ? : string
    } [] > ([])

    // ---- Directus <-> SVAR mapping -------------------------------------------

    function toSvar(record: CalendarEventRecord): SvarEvent {
        return {
            id: record.id as string | number,
            start: new Date(record.start_date),
            end: new Date(record.end_date),
            text: record.text,
            allDay: record.all_day ?? false,
            rrule: record.rrule ?? undefined,
            calendarId: record.calendar_id,
            description: record.description ?? undefined,
            status: record.status ?? undefined,
        }
    }

    function toRecord(ev: any): CalendarEventRecord {
        const rec: CalendarEventRecord = {
            text: ev.text ?? 'Untitled',
            start_date: new Date(ev.start).toISOString(),
            end_date: new Date(ev.end).toISOString(),
            all_day: !!ev.allDay,
            rrule: ev.rrule ?? null,
            calendar_id: ev.calendarId ?? groups.value[0]?.id,
            description: ev.description ?? null,
            status: ev.status ?? null,
        }
        return rec
    }

    async function load() {
        const [records, groupRecords] = await Promise.all([fetchEvents(), fetchGroups()])
        groups.value = groupRecords
        groupOptions.value = groupRecords.map((g) => ({
            id: g.id as string,
            label: g.label,
            active: g.active ?? true,
            css: g.color ? `svc-event--${g.id}` : undefined,
        }))
        events.value = records.map(toSvar)
    }

    // ---- Recurrence-aware persistence ----------------------------------------

    // SVAR expands recurring masters into occurrences. Each occurrence carries
    // `masterEventId` + `originalDate` when it is not the master itself.
    // - mode "single":  exclude the original occurrence date on the master and
    //   persist the edited instance as its own standalone event.
    // - mode "following": update the master's RRULE with UNTIL = day before the
    //   edited occurrence, then persist the edit from that date forward.
    async function persistUpdate(id: string | number, ev: any, mode ? : 'single' | 'following', originalDate ? :
    string) {
        const record = toRecord(ev)

        if (mode === 'single' && originalDate) {
            const masterId = (ev.masterEventId ?? id) as string | number
            const master = events.value.find((e: SvarEvent) => e.id === masterId)
            const exdates = new Set < string > (
                (master?.rrule ? (await getMasterExdates(masterId)) : []),
            )
            exdates.add(originalDate.slice(0, 10))
            await updateEvent(masterId, {
                exdates: Array.from(exdates).join(',')
            })

            // Standalone event for the edited instance (no rrule).
            const {
                rrule,
                ...instance
            } = record
            await createEvent({
                ...instance,
                rrule: null
            })
            return
        }

        if (mode === 'following' && originalDate) {
            const masterId = (ev.masterEventId ?? id) as string | number
            const master = events.value.find((e: SvarEvent) => e.id === masterId)
            const baseRule = master?.rrule ?? record.rrule ?? ''
            const until = new Date(new Date(originalDate).getTime() - 24 * 60 * 60 * 1000)
                .toISOString()
                .replace(/[-:]/g, '')
                .slice(0, 15) + 'Z'
            const newRule = baseRule ?
                baseRule.replace(/;?UNTIL=[^;]+/i, '') + `;UNTIL=${until}` :
                baseRule
            await updateEvent(masterId, {
                ...record,
                rrule: newRule
            })
            return
        }

        await updateEvent(id, record)
    }

    async function getMasterExdates(id: string | number): Promise < string[] > {
        try {
            const rec = await fetchEvents()
            const found = rec.find((r) => r.id === id)
            return found?.exdates ? found.exdates.split(',').map((s) => s.trim()).filter(Boolean) : []
        } catch {
            return []
        }
    }

    // ---- API lifecycle --------------------------------------------------------

    function init(a: any) {
        api.value = a

        // Persist user-driven changes to Directus.
        a.on('add-event', async ({
            event
        }: any) => {
            await createEvent(toRecord(event))
            await load()
        })

        a.on('update-event', async ({
            id,
            event,
            mode,
            originalDate
        }: any) => {
            await persistUpdate(id, event, mode, originalDate)
            await load()
        })

        a.on('delete-event', async ({
            id
        }: any) => {
            await deleteEvent(id)
            await load()
        })
    }

    // ---- Context menu (duplicate) -------------------------------------------

    const menuOptions = [
        ...getMenuOptions(),
        {
            id: 'duplicate',
            text: 'Duplicate',
            icon: 'wxi-empty'
        },
    ]

    function onMenuClick({
        action,
        context
    }: any) {
        if (action.id === 'duplicate' && api.value) {
            api.value.exec('add-event', {
                event: {
                    ...context,
                    id: undefined
                }
            })
        }
    }

    // ---- Toolbar: iCal import / export ---------------------------------------

    // NOTE: in @svar-ui/vue-calendar@2.6.0 the `toolbar` prop is typed as
    // { buttons?: ToolbarItem[]; css?: string } (not `items` as older docs show).
    const toolbar = {
        buttons: [
            ...getToolbarItems(),
            {
                id: 'import-ical',
                comp: 'button',
                text: 'Import iCal'
            },
            {
                id: 'export-ical',
                comp: 'button',
                text: 'Export iCal'
            },
        ],
    }

    function onToolbarAction({
        id
    }: {
        id: string
    }) {
        if (id === 'import-ical') fileInput.value?.click()
        if (id === 'export-ical') exportICal()
    }

    function exportICal() {
        if (!api.value) return
        const ics = serializeICal(api.value.getEvents())
        const blob = new Blob([ics], {
            type: 'text/calendar'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `calendar-${new Date().toISOString().slice(0, 10)}.ics`
        a.click()
        URL.revokeObjectURL(url)
    }

    async function onFilePicked(e: Event) {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) return
        const text = await file.text()
        const imported = parseICal(text) as SvarEvent[]
        for (const ev of imported) {
            if (ev.id == null || !events.value.some((e: SvarEvent) => e.id === ev.id)) {
                await createEvent(toRecord(ev))
            }
        }
        await load()
        target.value = ''
    }

    // ---- Styling --------------------------------------------------------------

    function cellClass(date: Date): string {
        const day = date.getDay()
        return day === 0 || day === 6 ? 'weekend' : ''
    }

    function eventClass(ev: any): string {
        return ev.calendarId ? `svc-event--${ev.calendarId}` : ''
    }

    onMounted(load)
    onBeforeUnmount(() => {
        if (api.value) {
            api.value.detach('add-event')
            api.value.detach('update-event')
            api.value.detach('delete-event')
        }
    })

    const {
        data: dateBar
    } = await useAsyncData('dateBar', async () => {
        const resp = await $directus.request($readItem('navigation', '93', {
            fields: ['*', { '*': ['*'] }]
        }))
        return resp?.data ?? resp ?? null
    })

    const dateBarName = computed(() => dateBar.value?.name)

    useHead({
        title: () => dateBar.value?.name || 'Meeovi Dates'
    })
</script>

<style>
    .calendar-wrap {
        height: 100%;
    }

    .svc-event--work {
        --svc-event-bg: #3b82f6;
    }

    .svc-event--personal {
        --svc-event-bg: #22c55e;
    }

    .weekend {
        background: rgba(0, 0, 0, 0.03);
    }
</style>