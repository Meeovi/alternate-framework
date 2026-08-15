// Directus collection schema for the calendar feature — applied live via
// the Directus API (see useCalendar.ts). Field names map 1:1 to
// `useCalendar.ts` in `#social/composables/calendar/useCalendar`.
//
//   social_calendar_groups  (calendar group / filter sidebar source)
//   social_calendar_events  (individual events, including recurring masters)
//
// Named social_calendar_* rather than calendar_*/calendar_events — those
// names are already a real, active M2M junction table linking the legacy
// `calendar`/`events` collections; reusing them would have collided.
// user (on events) is a flat uuid, not a directus_users relation —
// better-auth users (the app's real user accounts) live in a separate
// database from Directus.

export const calendarGroupsCollection = {
  collection: 'social_calendar_groups',
  meta: {
    icon: 'calendar_month',
    note: 'Calendar groups used for filtering and coloring events',
    sort_field: 'label',
  },
  schema: {},
  fields: [
    {
      field: 'id',
      type: 'string',
      meta: { interface: 'input', readonly: true, special: ['uuid'] },
      schema: { is_primary_key: true },
    },
    { field: 'label', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'color', type: 'string', meta: { interface: 'select-color' } },
    { field: 'active', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean' } },
  ],
}

export const calendarEventsCollection = {
  collection: 'social_calendar_events',
  meta: {
    icon: 'event',
    note: 'Calendar events (supports iCal RRULE recurrence)',
    sort_field: 'start_date',
  },
  schema: {},
  fields: [
    {
      field: 'id',
      type: 'integer',
      meta: { interface: 'input', readonly: true },
      schema: { is_primary_key: true, has_auto_increment: true },
    },
    { field: 'text', type: 'string', meta: { interface: 'input', required: true, width: 'full' } },
    {
      field: 'start_date',
      type: 'timestamp',
      meta: { interface: 'datetime', required: true },
      schema: { is_nullable: false },
    },
    {
      field: 'end_date',
      type: 'timestamp',
      meta: { interface: 'datetime', required: true },
      schema: { is_nullable: false },
    },
    { field: 'all_day', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean' } },
    {
      field: 'rrule',
      type: 'string',
      meta: { interface: 'input', note: 'iCal RRULE, e.g. FREQ=WEEKLY;BYDAY=MO,WE,FR', width: 'full' },
    },
    {
      field: 'exdates',
      type: 'string',
      meta: { interface: 'input', note: 'Comma-separated excluded occurrence dates (YYYY-MM-DD)' },
    },
    {
      field: 'calendar_id',
      type: 'string',
      meta: { interface: 'input', note: 'Calendar group id used for filtering/coloring' },
    },
    { field: 'description', type: 'text', meta: { interface: 'input-rich-text-md', width: 'full' } },
    { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
      { text: 'Confirmed', value: 'confirmed' },
      { text: 'Tentative', value: 'tentative' },
      { text: 'Cancelled', value: 'cancelled' },
    ] } } },
    {
      // Flat reference to a better-auth user id, not a directus_users
      // relation — better-auth users live in a separate database.
      field: 'user',
      type: 'uuid',
      meta: { interface: 'input', note: 'better-auth user id' },
      schema: { is_nullable: true },
    },
  ],
}

export const calendarCollections = [calendarGroupsCollection, calendarEventsCollection]
