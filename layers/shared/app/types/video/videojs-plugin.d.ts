// videojs-plugin.d.ts
export interface VideoJsPlugin {
  name: string

  // Called before player is created
  beforeCreate?(config: any): void

  // Called after player is created
  onCreate?(player: any, videojs: any): void

  // Called when player is ready
  onReady?(player: any): void

  // Called on every event
  onEvent?(event: string, data: any, player: any): void

  // Called before player is destroyed
  onDestroy?(player: any): void
}
