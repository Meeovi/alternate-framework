// Moderation labels on Bluesky content, as Meeovi applies them.
//
// Labels come from labelers: Bluesky's own moderation service, and
// Meeovi's Ozone (ATPROTO_LABELER_DID — the labeler our moderators run at
// ozone.meeovicms.com). Every AppView read asks for both
// (`atproto-accept-labelers`, see configureLabelers below); the AppView
// also returns authors' self-labels (e.g. a photographer marking nudity).
// Each note / account then gets one action:
//   hide  — not shown at all (takedowns, spam, scams…);
//   blur  — media covered until the viewer chooses to see it (adult or
//           graphic media);
//   warn  — a content warning over the whole note (!warn, misleading…,
//           and any label we don't know, so a new label from our Ozone
//           never shows unwarned).
// Lists of values can be extended with ATPROTO_LABELS_HIDE / _BLUR / _WARN
// (comma separated) without a code change.
import { AtpAgent } from '@atproto/api'

/** Bluesky's moderation service (always applied by Bluesky apps). */
export const BLUESKY_MODERATION_DID = 'did:plc:ar7c4by46qjdydhdevvrndac'

export type ModerationAction = 'hide' | 'blur' | 'warn'

export type FederatedModeration = {
  action: ModerationAction
  /** The label values behind it (shown to the viewer as the reason). */
  reasons: string[]
  /** `!no-unauthenticated`: the author asked not to be shown to signed-out visitors. */
  signedInOnly?: boolean
}

const fromEnv = (name: string) => String(process.env[name] || '').split(',').map((v) => v.trim()).filter(Boolean)

const HIDE = new Set(['!hide', '!takedown', 'spam', 'scam', 'impersonation', 'csam', 'dmca-violation', 'doxxing', ...fromEnv('ATPROTO_LABELS_HIDE')])
const BLUR = new Set(['porn', 'sexual', 'nudity', 'graphic-media', 'gore', 'sexual-figurative', ...fromEnv('ATPROTO_LABELS_BLUR')])
const WARN = new Set(['!warn', 'misleading', 'rude', 'intolerant', 'threat', 'self-harm', ...fromEnv('ATPROTO_LABELS_WARN')])
// Not about what's shown (`bot`: an automated account says so itself).
const IGNORE = new Set(['!no-promote', '!no-unauthenticated', 'bot', ...fromEnv('ATPROTO_LABELS_IGNORE')])

/** The action for a set of label values, or null when nothing applies. */
export function moderate(...labelSets: Array<string[] | undefined>): FederatedModeration | null {
  const values = [...new Set(labelSets.flatMap((set) => set ?? []))]
  if (!values.length) return null
  const signedInOnly = values.includes('!no-unauthenticated') || undefined
  const pick = (test: (v: string) => boolean) => values.filter(test)
  const hide = pick((v) => HIDE.has(v))
  if (hide.length) return { action: 'hide', reasons: hide, signedInOnly }
  const blur = pick((v) => BLUR.has(v))
  const warn = pick((v) => WARN.has(v) || (!BLUR.has(v) && !IGNORE.has(v)))
  if (warn.length) return { action: 'warn', reasons: [...warn, ...blur], signedInOnly }
  if (blur.length) return { action: 'blur', reasons: blur, signedInOnly }
  return signedInOnly ? { action: 'warn', reasons: [], signedInOnly } : null
}

export const isHiddenByModeration = (m: FederatedModeration | null | undefined) => m?.action === 'hide'

/** Meeovi's labeler (Ozone), when one is configured. */
export function meeoviLabelerDid(): string | null {
  const did = String(process.env.ATPROTO_LABELER_DID || '').trim()
  return /^did:(plc|web):[A-Za-z0-9._:%-]+$/.test(did) ? did : null
}

/**
 * Ask every AppView read for labels from Bluesky's moderation and ours.
 * As "app labelers" (not user-chosen ones) their takedowns are also
 * redacted by the AppView. Global to @atproto/api, so it covers the
 * service account and members' own sessions alike. Call once at boot.
 */
export function configureLabelers(): string[] {
  const labelers = [BLUESKY_MODERATION_DID, meeoviLabelerDid()].filter((d): d is string => !!d)
  AtpAgent.configure({ appLabelers: labelers })
  return labelers
}
