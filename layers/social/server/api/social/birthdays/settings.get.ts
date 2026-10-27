import { requireAuth } from '#auth/server/utils/sessions'
import { isMissingColumn, readSettings } from '#social/server/utils/birthdays'

// GET /api/social/birthdays/settings — the signed-in member's own date of
// birth and how they like to send birthday wishes ('post' | 'message').
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  try {
    return { available: true, ...(await readSettings(user.id)) }
  } catch (error) {
    if (isMissingColumn(error)) return { available: false, birthDate: null, greeting: 'post' }
    throw error
  }
})
