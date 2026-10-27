import { and, eq, inArray, isNotNull, isNull, or } from 'drizzle-orm'
import { date, pgTable, text, uuid, boolean as pgBoolean, timestamp } from 'drizzle-orm/pg-core'
import { createDirectus, rest, staticToken, readItems, createItem } from '@directus/sdk'
import { db } from '#auth/server/utils/drizzle'

/**
 * Birthdays of the people a member follows (/connect/birthdays), Facebook
 * style: today's and the coming weeks', with a greeting posted on their
 * profile or sent as a private message — whichever the member prefers.
 *
 * Dates of birth live on better-auth "users" (migration
 * 20261027160000_birthdays), never in Directus: the /api/cms proxy refuses
 * every read of "users", and these helpers only ever hand out the day and
 * month, and only of people the asker follows.
 *
 * The two columns are declared here rather than in schema.ts's `users`:
 * better-auth's adapter selects every column it's given, so declaring them
 * there before the migration is applied would break sign-in.
 */
const birthdayUsers = pgTable('users', {
  id: uuid('id'),
  name: text('name'),
  username: text('username'),
  image: text('image'),
  birthDate: date('birth_date'),
  birthdayGreeting: text('birthday_greeting'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  authBanned: pgBoolean('auth_banned'),
})

export type Greeting = 'post' | 'message'
export const GREETINGS: readonly Greeting[] = ['post', 'message']
/** How far ahead "Upcoming" looks. */
export const UPCOMING_DAYS = 30
/** Greetings are accepted from the day before to the day after (time zones). */
export const GREET_WINDOW_DAYS = 1

export type BirthdaySettings = { birthDate: string | null, greeting: Greeting }
export type FollowedBirthday = {
  id: string
  name: string
  username: string | null
  image: string | null
  month: number
  day: number
  /** 0 = today. */
  daysAway: number
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** True when the migration hasn't been applied yet (Postgres "undefined column"). */
export function isMissingColumn(error: unknown): boolean {
  const e = error as { code?: string, cause?: { code?: string } }
  return e?.code === '42703' || e?.cause?.code === '42703'
}

/** A valid calendar date as UTC midnight, or null. */
export function parseDate(value: unknown): Date | null {
  const match = ISO_DATE.exec(String(value ?? ''))
  if (!match) return null
  const [, y, m, d] = match.map(Number) as [number, number, number, number]
  const parsed = new Date(Date.UTC(y, m - 1, d))
  return parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d ? parsed : null
}

/**
 * The asker's "today": the date their browser sends, if it's within a day of
 * the server's (so a member in Sydney sees Sydney's birthdays); else UTC's.
 */
export function resolveToday(clientToday: unknown, now = new Date()): Date {
  const serverToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const client = parseDate(clientToday)
  if (client && Math.abs(client.getTime() - serverToday.getTime()) <= 86_400_000) return client
  return serverToday
}

/** Days from `today` to the next birthday on `birthDate` (0 = today). 29 Feb falls on 28 Feb in other years. */
export function daysUntilBirthday(birthDate: Date, today: Date): number {
  const month = birthDate.getUTCMonth()
  const day = birthDate.getUTCDate()
  const on = (year: number) => {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    return Date.UTC(year, month, month === 1 && day === 29 && !leap ? 28 : day)
  }
  let next = on(today.getUTCFullYear())
  if (next < today.getTime()) next = on(today.getUTCFullYear() + 1)
  return Math.round((next - today.getTime()) / 86_400_000)
}

/** Within the greeting window: today, or a day either side. */
export function isBirthdayNear(birthDate: Date, today: Date): boolean {
  const ahead = daysUntilBirthday(birthDate, today)
  const behind = daysUntilBirthday(birthDate, new Date(today.getTime() - GREET_WINDOW_DAYS * 86_400_000))
  return ahead <= GREET_WINDOW_DAYS || behind <= GREET_WINDOW_DAYS
}

/** A date of birth a member may save: a real date, not in the future, from 1900 on. */
export function validBirthDate(value: unknown, now = new Date()): string | null {
  const parsed = parseDate(value)
  if (!parsed || parsed.getUTCFullYear() < 1900 || parsed.getTime() > now.getTime()) return null
  return String(value)
}

const active = and(isNull(birthdayUsers.deletedAt), or(isNull(birthdayUsers.authBanned), eq(birthdayUsers.authBanned, false)))

export async function readSettings(userId: string): Promise<BirthdaySettings> {
  const [row] = await db
    .select({ birthDate: birthdayUsers.birthDate, greeting: birthdayUsers.birthdayGreeting })
    .from(birthdayUsers)
    .where(eq(birthdayUsers.id, userId))
    .limit(1)
  return { birthDate: row?.birthDate ?? null, greeting: row?.greeting === 'message' ? 'message' : 'post' }
}

export async function saveSettings(userId: string, settings: BirthdaySettings): Promise<void> {
  await db
    .update(birthdayUsers)
    .set({ birthDate: settings.birthDate, birthdayGreeting: settings.greeting })
    .where(eq(birthdayUsers.id, userId))
}

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

/** better-auth ids of the members `userId` follows. */
export async function followedIds(userId: string): Promise<string[]> {
  const rows = await directus.request(readItems('follows', {
    fields: ['target_id'],
    filter: { follower_id: { _eq: userId }, target_type: { _eq: 'user' } },
    limit: -1,
  })) as Array<{ target_id?: string | null }>
  return [...new Set(rows.map((row) => String(row.target_id ?? '')).filter(Boolean))]
}

/** Followed members with a birthday within UPCOMING_DAYS of `today`, soonest first. */
export async function followedBirthdays(userId: string, today: Date): Promise<FollowedBirthday[]> {
  const ids = await followedIds(userId)
  if (!ids.length) return []
  const rows = await db
    .select({
      id: birthdayUsers.id,
      name: birthdayUsers.name,
      username: birthdayUsers.username,
      image: birthdayUsers.image,
      birthDate: birthdayUsers.birthDate,
    })
    .from(birthdayUsers)
    .where(and(inArray(birthdayUsers.id, ids), isNotNull(birthdayUsers.birthDate), active))
  return rows
    .map((row) => {
      const born = parseDate(row.birthDate)
      if (!born || !row.id) return null
      return {
        id: row.id,
        name: row.name || row.username || 'Member',
        username: row.username ?? null,
        image: row.image ?? null,
        month: born.getUTCMonth() + 1,
        day: born.getUTCDate(),
        daysAway: daysUntilBirthday(born, today),
      }
    })
    .filter((row): row is FollowedBirthday => !!row && row.daysAway <= UPCOMING_DAYS)
    .sort((a, b) => a.daysAway - b.daysAway || a.name.localeCompare(b.name))
}

/** The member to greet, if `userId` follows them and their birthday is near `today`. */
export async function greetableMember(userId: string, targetId: string, today: Date) {
  if (targetId === userId) return null
  const ids = await followedIds(userId)
  if (!ids.includes(targetId)) return null
  const [row] = await db
    .select({ id: birthdayUsers.id, name: birthdayUsers.name, username: birthdayUsers.username, birthDate: birthdayUsers.birthDate })
    .from(birthdayUsers)
    .where(and(eq(birthdayUsers.id, targetId), active))
    .limit(1)
  const born = parseDate(row?.birthDate)
  if (!row?.id || !born || !isBirthdayNear(born, today)) return null
  return { id: row.id, name: row.name || row.username || 'Member', username: row.username ?? null }
}

/**
 * A birthday greeting on the member's profile: a public note by the sender,
 * addressed to them through target_audience "user:<id>" (the profile pages
 * show notes addressed to their owner).
 */
export async function createGreetingPost(sender: { id: string, name?: string | null, image?: string | null }, recipient: { id: string, name: string }, content: string, slug: string) {
  return directus.request(createItem('posts', {
    content,
    slug,
    title: `Happy birthday, ${recipient.name}!`,
    status: 'published',
    content_type: 'Post',
    visibility_scope: 'public',
    target_audience: `user:${recipient.id}`,
    creator_id: sender.id,
    username: sender.name ?? null,
    user_avatar: sender.image ?? null,
    // `gallery` is NOT NULL on the collection.
    gallery: [],
  })) as Promise<{ id?: number, slug?: string }>
}
