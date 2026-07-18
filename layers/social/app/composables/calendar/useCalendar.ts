// Directus-backed calendar persistence for the SVAR Vue Calendar.
//
// Collection: `calendar_events`
//   id          auto
//   text        string            event title
//   start_date  timestamp         occurrence start
//   end_date    timestamp         occurrence end
//   all_day     boolean
//   rrule       string|null       iCal recurrence rule (RRULE)
//   exdates     csv|null          comma-separated excluded occurrence dates (YYYY-MM-DD)
//   calendar_id string            calendar group id used for filtering/coloring
//   description text|null
//   status      string|null
//   user        m2o -> directus_users
//
// Collection: `calendar_groups` (sidebar groups for filtering)
//   id          string (manual, e.g. "work")
//   label       string
//   color       string (css color)
//   active      boolean (default true)
//
// See `schema/calendar-collections.ts` for the Directus snapshot used to
// provision these collections.

import { useDirectusRequest } from '#social/composables/content/useDirectusRequest'

const COLLECTION = 'calendar_events'

export interface CalendarEventRecord {
  id?: string | number
  text: string
  start_date: string
  end_date: string
  all_day?: boolean
  rrule?: string | null
  exdates?: string | null
  calendar_id?: string
  description?: string | null
  status?: string | null
  user?: string | null
}

export interface CalendarGroupRecord {
  id?: string
  label: string
  color?: string
  active?: boolean
}

const FIELDS = [
  'id',
  'text',
  'start_date',
  'end_date',
  'all_day',
  'rrule',
  'exdates',
  'calendar_id',
  'description',
  'status',
  'user',
]

export function useCalendar() {
  const { readItems, createItem, updateItem, deleteItem } = useDirectusRequest()

  async function fetchEvents(range?: { start: Date; end: Date }): Promise<CalendarEventRecord[]> {
    const now = new Date()
    const opts: any = {
      fields: FIELDS,
      sort: ['start_date'],
      limit: -1,
    }
    // Optional window filter to bound the query.
    if (range?.start && range?.end) {
      opts.filter = {
        start_date: { _lte: range.end.toISOString() },
        end_date: { _gte: range.start.toISOString() },
      }
    } else {
      // Default: pull a generous window so recurring masters are present.
      const past = new Date(now.getFullYear() - 1, 0, 1).toISOString()
      const future = new Date(now.getFullYear() + 2, 11, 31).toISOString()
      opts.filter = {
        start_date: { _lte: future },
        end_date: { _gte: past },
      }
    }
    return (await readItems(COLLECTION, opts)) as CalendarEventRecord[]
  }

  async function fetchGroups(): Promise<CalendarGroupRecord[]> {
    try {
      return (await readItems('calendar_groups', {
        fields: ['id', 'label', 'color', 'active'],
        limit: -1,
      })) as CalendarGroupRecord[]
    } catch {
      return []
    }
  }

  async function createEvent(record: CalendarEventRecord): Promise<CalendarEventRecord> {
    return (await createItem(COLLECTION, record)) as CalendarEventRecord
  }

  async function updateEvent(id: string | number, record: Partial<CalendarEventRecord>): Promise<void> {
    await updateItem(COLLECTION, id, record)
  }

  async function deleteEvent(id: string | number): Promise<void> {
    await deleteItem(COLLECTION, id)
  }

  return { fetchEvents, fetchGroups, createEvent, updateEvent, deleteEvent }
}
