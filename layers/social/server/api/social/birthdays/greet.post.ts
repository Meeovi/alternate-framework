import { getRequestHeader } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { checkSpam } from '../../../../../shared/server/utils/spam'
import { newPostSlug } from '#social/app/utils/postPath'
import {
  createGreetingPost, greetableMember, GREETINGS, isMissingColumn, readSettings, resolveToday, type Greeting,
} from '#social/server/utils/birthdays'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_TEXT = 1000

// POST /api/social/birthdays/greet { userId, text, via?, today? }
// Wishes a followed member happy birthday — on the day, or a day either side
// — as a note on their profile ('post') or a private message ('message').
// `via` defaults to the sender's saved preference.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{ userId?: unknown, text?: unknown, via?: unknown, today?: unknown }>(event).catch(() => null)

  const targetId = String(body?.userId ?? '')
  if (!UUID.test(targetId)) throw createError({ statusCode: 400, statusMessage: 'Choose who to wish happy birthday' })
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  if (!text) throw createError({ statusCode: 400, statusMessage: 'Write a birthday message' })
  if (text.length > MAX_TEXT) throw createError({ statusCode: 400, statusMessage: `Keep it under ${MAX_TEXT} characters` })

  let via: Greeting
  let recipient: Awaited<ReturnType<typeof greetableMember>>
  try {
    via = GREETINGS.includes(body?.via as Greeting) ? body!.via as Greeting : (await readSettings(user.id)).greeting
    recipient = await greetableMember(user.id, targetId, resolveToday(body?.today))
  } catch (error) {
    if (isMissingColumn(error)) throw createError({ statusCode: 503, statusMessage: "Birthdays aren't switched on yet" })
    throw error
  }
  if (!recipient) throw createError({ statusCode: 403, statusMessage: "You can wish people you follow a happy birthday on their birthday" })

  if (via === 'message') {
    const apiBase = (useRuntimeConfig(event).public as Record<string, any>).meeoviDiscussions?.apiBase
    if (!apiBase) throw createError({ statusCode: 501, statusMessage: "Private messages aren't available here" })
    const { rid } = await $fetch<{ rid: string }>(`${apiBase}/messages`, {
      method: 'POST',
      body: { userId: recipient.id, text },
      headers: { cookie: getRequestHeader(event, 'cookie') || '' },
    })
    return { via, rid }
  }

  const verdict = checkSpam(text, { authorId: user.id, scope: 'birthday' })
  if (verdict.spam) throw createError({ statusCode: 422, statusMessage: 'That message looks like spam' })
  const created = await createGreetingPost(
    { id: user.id, name: (user as { name?: string }).name, image: (user as { image?: string }).image },
    recipient,
    text,
    newPostSlug(text),
  )
  return { via, postId: created?.id ?? null, slug: created?.slug ?? null }
})
