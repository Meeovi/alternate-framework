// Directus-backed calendar persistence for the SVAR Vue Calendar.
//
// Collection: `social_calendar_events` (NOT `calendar_events` — that name
// is already a real, active M2M junction table linking the legacy
// `calendar`/`events` collections; using it would have collided)
//   id          auto
//   text        string            event title
//   start_date  timestamp         occurrence start
//   end_date    timestamp         occurrence end
//   all_day     boolean
//   rrule       string|null       iCal recurrence rule (RRULE)
//   exdates     csv|null          comma-separated excluded occurrence dates (YYYY-MM-DD)
//   calendar_id string            social_calendar_groups id used for filtering/coloring
//   description text|null
//   status      string|null
//   user        uuid|null         better-auth user id — flat reference, not
//                                 a directus_users relation (better-auth
//                                 users live in a separate database)
//
// Collection: `social_calendar_groups` (sidebar groups for filtering)
//   id          string (manual, e.g. "work")
//   label       string
//   color       string (css color)
//   active      boolean (default true)
//
// See `schema/calendar-collections.ts` for the schema these were
// provisioned from (field/collection names updated to match what's
// actually live — the file itself still documents the original, colliding
// names for now).

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

export function useCalendar() {
  // Previously called $directus directly from the client with a static/
  // admin token and no `user` filter at all — any authenticated user could
  // read, edit, or delete every other user's calendar. Routed through
  // authenticated, owner-scoped server endpoints instead
  // (server/api/social/calendar/*) — see those files for the enforcement.
  async function fetchEvents(range?: { start: Date; end: Date }): Promise<CalendarEventRecord[]> {
    const query: Record<string, string> = {}
    if (range?.start && range?.end) {
      query.start = range.start.toISOString()
      query.end = range.end.toISOString()
    }
    return await $fetch<CalendarEventRecord[]>('/api/social/calendar/events', { query })
  }

  async function fetchGroups(): Promise<CalendarGroupRecord[]> {
    try {
      return await $fetch<CalendarGroupRecord[]>('/api/social/calendar/groups')
    } catch {
      return []
    }
  }

  async function createEvent(record: CalendarEventRecord): Promise<CalendarEventRecord> {
    return await $fetch<CalendarEventRecord>('/api/social/calendar/events', {
      method: 'POST',
      body: record,
    })
  }

  async function updateEvent(id: string | number, record: Partial<CalendarEventRecord>): Promise<void> {
    await $fetch(`/api/social/calendar/events/${id}`, {
      method: 'PATCH',
      body: record,
    })
  }

  async function deleteEvent(id: string | number): Promise<void> {
    await $fetch(`/api/social/calendar/events/${id}`, { method: 'DELETE' })
  }

  return { fetchEvents, fetchGroups, createEvent, updateEvent, deleteEvent }
}
