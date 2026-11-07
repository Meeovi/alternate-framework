import { createError, type H3Event } from 'h3'
import { requireSeller } from '#auth/server/utils/sessions'

/** The signed-in seller (linked videos are store products, so only sellers add them). */
export async function requireVideoSeller(event: H3Event): Promise<{ id: string, username: string, admin: boolean }> {
  const user = await requireSeller(event).catch((error: any) => {
    if (error?.statusCode === 403) throw createError({ statusCode: 403, statusMessage: 'Only sellers can add videos. Become a seller in your account settings first.', data: { code: 'not-seller' } })
    throw createError({ statusCode: 401, statusMessage: 'Sign in to add videos' })
  }) as { id: string, username?: string | null, role?: string | null }
  if (!user.username) throw createError({ statusCode: 409, statusMessage: 'Choose a username in your account settings first.' })
  const admin = String(user.role || '').split(',').map((r) => r.trim()).includes('admin')
  return { id: String(user.id), username: String(user.username).toLowerCase(), admin }
}
