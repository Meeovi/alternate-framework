export type VideojsPlayer = {
  currentType?: () => string
  qualityLevels?: () => unknown
  hlsQualitySelector?: (options?: Record<string, unknown>) => unknown
  vr?: (options?: Record<string, unknown>) => unknown
  share?: (options?: Record<string, unknown>) => unknown
  ads?: (options?: Record<string, unknown>) => unknown
  wavesurfer?: (options?: Record<string, unknown>) => unknown
  persist?: (options?: Record<string, unknown>) => unknown
  [key: string]: unknown
}
