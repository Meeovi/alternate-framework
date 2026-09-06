/// <reference lib="WebWorker" />

// Vendored from idb-keyval (MIT, Jake Archibald) so the service worker has no
// runtime dependency. Only the subset used by notification.ts is kept: `get`
// and `closeDatabases`.

export function promisifyRequest<T = undefined>(
  request: IDBRequest<T> | IDBTransaction,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // @ts-expect-error - file size hacks
    request.oncomplete = request.onsuccess = () => resolve(request.result)
    // @ts-expect-error - file size hacks
    request.onabort = request.onerror = () => reject(request.error)
  })
}

export function createStore(dbName: string, storeName: string): UseStore {
  const request = indexedDB.open(dbName)
  request.onupgradeneeded = () => request.result.createObjectStore(storeName)
  const dbp = promisifyRequest(request)

  openDatabases.set(dbName, { close: () => dbp.then(db => db.close()) })

  return (txMode, callback) =>
    dbp.then(db =>
      callback(db.transaction(storeName, txMode).objectStore(storeName)),
    )
}

export type UseStore = <T>(
  txMode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => T | PromiseLike<T>,
) => Promise<T>

const openDatabases = new Map<string, { close: () => void }>()

let defaultGetStoreFunc: UseStore | undefined

function defaultGetStore() {
  if (!defaultGetStoreFunc)
    defaultGetStoreFunc = createStore('keyval-store', 'keyval')

  return defaultGetStoreFunc
}

export function get<T = any>(
  key: IDBValidKey,
  customStore = defaultGetStore(),
): Promise<T | undefined> {
  return customStore('readonly', store => promisifyRequest(store.get(key)))
}

export function closeDatabases() {
  for (const db of openDatabases.values())
    db.close()

  openDatabases.clear()
  defaultGetStoreFunc = undefined
}
