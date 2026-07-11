
export function useNotify() {
  const adapter = NotifyAdapterRegistry.getDefaultAdapter()

  return {
    notify: (payload) => adapter.notify(payload),
    dismiss: (id) => adapter.dismiss(id),
    clear: () => adapter.clear(),
    getAdapter: () => adapter,
  }
}