export interface BaseAdapterConfig {
  enabled?: boolean
  timeoutMs?: number
}

export interface BaseAdapter<TConfig extends BaseAdapterConfig = BaseAdapterConfig> {
  id: string
  type: string
  config?: TConfig
}