import { betterAuth } from "better-auth";
import { sentinel } from "@better-auth/infra";

export const sentinelAuth = betterAuth({
  plugins: [
    sentinel({
      apiKey: process.env.BETTER_AUTH_API_KEY,
      security: {
        // Core protections
        credentialStuffing: {
          enabled: true,
          thresholds: { challenge: 3, block: 5 },
        },
        compromisedPassword: {
          enabled: true,
          action: "block",
        },
        emailValidation: {
          enabled: true,
          strictness: "medium",
          action: "block",
        },
        
        // Location-based
        impossibleTravel: {
          enabled: true,
          action: "challenge",
        },
        geoBlocking: {
          denyList: ["XX"],
          action: "block",
        },
        
        // Abuse prevention
        freeTrialAbuse: {
          enabled: true,
          maxAccountsPerVisitor: 3,
          action: "block",
        },
        velocity: {
          enabled: true,
          maxSignupsPerVisitor: 5,
          action: "challenge",
        },
        
        // Bot protection
        botBlocking: { action: "challenge" },
        suspiciousIpBlocking: { action: "block" },
        
        // Account monitoring
        staleUsers: {
          enabled: true,
          staleDays: 90,
          notifyUser: true,
          notifyAdmin: true,
          adminEmail: "security@yourapp.com",
        },
      },
    }),
  ],
});