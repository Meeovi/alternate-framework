// Shared types for @mframework/meeovi-player.

/** Which Video.js 10 preset plays the media. */
export type MeeoviPlayerKind = 'video' | 'audio' | 'live-video' | 'live-audio'

/** Video.js 10 skins: `default`, the cleaner `neutral`, or `compat`
 *  (closest to the classic Video.js 8 look). */
export type MeeoviPlayerSkin = 'default' | 'neutral' | 'compat'

export interface MeeoviPlayerModuleOptions {
  /** Default skin for every player. Default 'default'. */
  skin?: MeeoviPlayerSkin
}

export interface MeeoviPlayerPublicConfig {
  skin: MeeoviPlayerSkin
}
