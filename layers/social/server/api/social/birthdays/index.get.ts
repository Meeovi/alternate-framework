import { requireAuth } from '#auth/server/utils/sessions'
import { followedBirthdays, isMissingColumn, readSettings, resolveToday } from '#social/server/utils/birthdays'

// GET /api/social/birthdays?today=YYYY-MM-DD — birthdays of the people the
// signed-in member follows: today's, and the next 30 days' (day and month
// only). `today` is the browser's date, so the list follows the member's
// time zone. `available: false` until the birthdays migration is applied.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const today = resolveToday(getQuery(event).today)
  try {
    const [people, settings] = await Promise.all([followedBirthdays(user.id, today), readSettings(user.id)])
    return {
      available: true,
      greeting: settings.greeting,
      hasBirthDate: !!settings.birthDate,
      today: people.filter((person) => person.daysAway === 0),
      upcoming: people.filter((person) => person.daysAway > 0),
    }
  } catch (error) {
    if (isMissingColumn(error)) return { available: false, greeting: 'post', hasBirthDate: false, today: [], upcoming: [] }
    console.error('[birthdays] read failed:', (error as Error)?.message ?? error)
    throw createError({ statusCode: 502, statusMessage: "Birthdays couldn't be loaded" })
  }
})
