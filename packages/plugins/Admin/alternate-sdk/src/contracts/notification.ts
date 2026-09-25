
export interface NotifyAdapter {
  notify(payload: any): Promise<void>
  dismiss(id: string): Promise<void>
  clear(): Promise<void>
  listNotifications?(args?: Record<string, any>): Promise<any[]>
  getNotificationsSnapshot?(args?: Record<string, any>): Promise<any>
  markNotificationAsRead?(id: string, args?: Record<string, any>): Promise<void>
  markAllNotificationsAsRead?(args?: Record<string, any>): Promise<void>
}

export interface NotifyContract {
  notify(payload: any): Promise<void>
  dismiss(id: string): Promise<void>
  clear(): Promise<void>
  getAdapter(): () => NotifyAdapter
}

const notifyRegistry = new Map<string, NotifyAdapter>()
let defaultNotifyAdapter: NotifyAdapter | undefined

export function registerNotifyAdapter(name: string, adapter: NotifyAdapter): void {
  notifyRegistry.set(name, adapter)
}

export function getNotifyAdapter(name?: string): NotifyAdapter | undefined {
  if (name) return notifyRegistry.get(name)
  return defaultNotifyAdapter
}

export function setDefaultNotifyAdapter(adapter: NotifyAdapter): void {
  defaultNotifyAdapter = adapter
}

export const NotifyAdapterRegistry = {
  register: registerNotifyAdapter,
  get: getNotifyAdapter,
  getDefaultAdapter: () => defaultNotifyAdapter,
  setDefaultAdapter: setDefaultNotifyAdapter,
}