declare module '@mframework/core' {
  export const prisma: any
  export default prisma

  // organization helpers exported by @mframework/core
  export function createOrganization(data: any, ownerId: string): Promise<any>
  export function getOrganizationById(id: string): Promise<any>
  export function listOrganizationsForUser(userId: string): Promise<any>
  export function listMembers(organizationId: string): Promise<any>
  export function addMember(organizationId: string, userId: string, role?: string): Promise<any>
  export function removeMember(organizationId: string, userId: string): Promise<any>
  export function changeMemberRole(organizationId: string, userId: string, role: string): Promise<any>
  export function createInvite(organizationId: string, inviterId: string, email: string): Promise<any>
  export function acceptInvite(code: string, userId: string): Promise<any>
  export function updateOrganization(organizationId: string, updates: any): Promise<any>
  export function deleteOrganization(organizationId: string): Promise<any>
}
