// Directus collection schema for the calendar feature.
//
// Apply these via the Directus Admin UI (Settings > Data Model) or a migration
// tool. Field names map 1:1 to `useCalendar.ts` in
// `#social/composables/calendar/useCalendar`.
//
//   calendar_groups  (calendar group / filter sidebar source)
//   calendar_events  (individual events, including recurring masters)

export const calendarGroupsCollection = {
  collection: 'calendar_groups',
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
  collection: 'calendar_events',
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
      field: 'user',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', options: { collection: 'directus_users', displayTemplate: '{{email}}' } },
      schema: { foreign_key_column: 'user', foreign_key_table: 'directus_users', on_delete: 'SET NULL' },
    },
  ],
}

export const calendarCollections = [calendarGroupsCollection, calendarEventsCollection]
