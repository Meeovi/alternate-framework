import type { H3Event } from 'h3'

// TODO: Replace with actual imports for auth, db, and, getHeaders, getCookie, createError, and Organization
const auth = { api: { getSession: async () => ({ session: {}, user: { id: '', name: '', emailVerified: false, email: '', createdAt: new Date(), updatedAt: new Date() } }) } }
const db = { query: { member: { findFirst: async () => ({ organization: {} }) } } }
const and = (...args: any[]) => true
const getHeaders = (event: any) => ({});
const getCookie = (event: any, name: string) => 'orgid';
const createError = (obj: any) => new Error(obj.statusMessage);
type Organization = any;

export async function requireTeam(event: H3Event): Promise<{
  user: {
    id: string;
    name: string;
    emailVerified: boolean;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined | undefined;
  }
  team: {
    organization: Organization
  }
}> {
  const sessionData = await auth.api.getSession()

  if (!sessionData?.session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const { user } = sessionData
  const activeOrganizationId = getCookie(event, 'activeOrganizationId')

  if (!activeOrganizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No team selected'
    })
  }

  const member = await db.query.member.findFirst()

  if (!member) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Team not found'
    })
  }

  return {
    user,
    team: {
      organization: member.organization
    }
  }
}