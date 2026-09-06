/// <reference lib="WebWorker" />

// Message posted by the client to the service worker when the page enters the
// Page Lifecycle API "frozen" state, so the worker can release its IndexedDB
// connections. Vendored from Elk's app constants to keep the worker dependency-free.
export const ELK_PAGE_LIFECYCLE_FROZEN = 'ELK_PAGE_LIFECYCLE_FROZEN'
