import { betterAuth } from "better-auth";
import { deviceAuthorization } from "better-auth/plugins";
import crypto from "crypto";
import { prisma } from '@mframework/core'

export const deviceAuthorizationAuth = betterAuth({
  plugins: [
    deviceAuthorization({ 
      verificationUri: "/device", 
      validateClient: async (clientId) => {
    // Check if client is authorized via centralized Prisma client
    const client = await prisma.oauth_clients.findUnique({ where: { id: clientId } as any })
    return !!(client && (client as any).allowDeviceFlow)
  },

  onDeviceAuthRequest: async (clientId, scope) => {
    // Log device authorization requests into the audit log
    await prisma.audit_log_entries.create({ data: {
      id: crypto.randomUUID(),
      payload: { type: 'device_auth_request', clientId, scope },
      created_at: new Date(),
      ip_address: ''
    } as any })
  },
  generateDeviceCode: async () => {
    // Custom device code generation
    return crypto.randomBytes(32).toString("hex");
  },
  
  generateUserCode: async () => {
    // Custom user code generation
    // Default uses: ABCDEFGHJKLMNPQRSTUVWXYZ23456789
    // (excludes 0, O, 1, I to avoid confusion)
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += charset[Math.floor(Math.random() * charset.length)];
    }
    return code;
  },
    }), 
  ],
});

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
