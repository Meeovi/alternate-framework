import {
    APIError,
    betterAuth
} from "better-auth"
import crypto from 'crypto'
import {
    scim
} from "@better-auth/scim";
import { prisma } from '@mframework/core'

const userRoles = new Set(["admin"]);
const userAdminIds = new Set(["some-admin-user-id"]);

export const scimAuth = betterAuth({
    plugins: [
        scim({
            beforeSCIMTokenGenerated: async ({
                user,
                member,
                scimToken
            }) => {
                // IMPORTANT: Use this hook to restrict access to certain roles or users
                // At the very least access must be restricted to admin users (see example below)
                const userHasAdmin = member?.role && userRoles.has(member.role);
                const userIsAdmin = userAdminIds.size > 0 && userAdminIds.has(user.id);
                if (!userHasAdmin && !userIsAdmin) {
                    throw new APIError("FORBIDDEN", {
                        message: "User does not have enough permissions"
                    });
                }
            },
            afterSCIMTokenGenerated: async ({
                user,
                member,
                scimToken,
                scimProvider
            }) => {
                // Callback called after the scim token has been persisted
                // Persist a lightweight audit entry so the token is discoverable
                await prisma.audit_log_entries.create({ data: {
                    id: crypto?.randomUUID ? crypto.randomUUID() : 'scim-' + Date.now(),
                    payload: { type: 'scim_token_generated', scimToken },
                    created_at: new Date(),
                    ip_address: ''
                } as any })
            },
        })
    ]
})