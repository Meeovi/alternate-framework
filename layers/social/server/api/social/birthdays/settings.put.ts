import { requireAuth } from '#auth/server/utils/sessions'
import { GREETINGS, isMissingColumn, saveSettings, validBirthDate, type Greeting } from '#social/server/utils/birthdays'

// PUT /api/social/birthdays/settings { birthDate: 'YYYY-MM-DD' | null, greeting: 'post' | 'message' }
// Saves the signed-in member's own settings; birthDate null removes it.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{ birthDate?: unknown, greeting?: unknown }>(event).catch(() => null)

  const greeting = String(body?.greeting ?? 'post') as Greeting
  if (!GREETINGS.includes(greeting)) throw createError({ statusCode: 400, statusMessage: 'Choose post or message' })
  const clearing = body?.birthDate === null || body?.birthDate === ''
  const birthDate = clearing ? null : validBirthDate(body?.birthDate)
  if (!clearing && !birthDate) throw createError({ statusCode: 400, statusMessage: 'Enter a real date of birth' })

  try {
    await saveSettings(user.id, { birthDate, greeting })
  } catch (error) {
    if (isMissingColumn(error)) throw createError({ statusCode: 503, statusMessage: "Birthdays aren't switched on yet" })
    throw error
  }
  return { birthDate, greeting }
})
