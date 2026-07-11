import {
    betterAuth
} from "better-auth";
import { organization } from "better-auth/plugins";
import {
    dash,
    sentinel,
    sendEmail,
    createEmailSender,
} from "@better-auth/infra";

const emailSender = createEmailSender({
  apiKey: process.env.BETTER_AUTH_API_KEY,
  apiUrl: process.env.BETTER_AUTH_API_URL,
});

export const authInfra = betterAuth({
    emailSender,
    sendEmail: {
        enabled: true,
        async sendEmail({ user, url }) {
            await sendEmail({
                template: "verify-email",
                to: user.email,
                variables: {
                    verificationUrl: url,
                    userEmail: user.email,
                    verificationCode: "123456",        // Optional: for code-based verification
                    userName: user.name,                   // Optional
                    appName: `${process.env.NUXT_APP_NAME}`,               // Optional
                    expirationMinutes: "60",           // Optional
                },
            });
        }
    },
    emailAndPassword: {
        enabled: true,
        async sendResetPassword({ user, url }) {
            await sendEmail({
                template: "reset-password",
                to: user.email,
                variables: {
                    resetLink: url,
                    userEmail: user.email,
                    userName: user.name,
                    appName: `${process.env.NUXT_APP_NAME}`,
                },
            });
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        async sendVerificationEmail({ user, url }) {
            await sendEmail({
                template: "verify-email",
                to: user.email,
                variables: {
                    verificationUrl: url,
                    userEmail: user.email,
                    userName: user.name,
                    appName: `${process.env.NUXT_APP_NAME}`,
                },
            });
        },
    },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `https://yourapp.com/accept-invitation/${data.id}`;
        await sendEmail({
          template: "invitation",
          to: data.email,
          variables: {
            inviteLink,
            inviterName: data.inviter.user.name,
            inviterEmail: data.inviter.user.email,
            organizationName: data.organization.name,
            role: data.role,
            appName: `${process.env.NUXT_APP_NAME}`,
          },
        });
      },
    }),
    dash(),
    sentinel({
      apiKey: process.env.BETTER_AUTH_API_KEY,
      security: {
        credentialStuffing: {
          enabled: true,
          thresholds: {
            challenge: 3, // Issue PoW challenge after 3 failures
            block: 5, // Block after 5 failures
                    },
                    windowSeconds: 3600, // 1 hour window
                    cooldownSeconds: 900, // 15 minute cooldown after block
                },
                impossibleTravel: {
                    enabled: true,
                    maxSpeedKmh: 1000, // Max realistic travel speed
                    action: "challenge", // "log", "challenge", or "block"
                },
                freeTrialAbuse: {
                    enabled: true,
                    thresholds: {
                        challenge: 2,
                        block: 3,
                    },
                    maxAccountsPerVisitor: 3,
                    action: "block",
                },
                compromisedPassword: {
                    enabled: true,
                    action: "block", // "log", "challenge", or "block"
                    minBreachCount: 1, // Minimum breaches to trigger
                },
                staleUsers: {
                    enabled: true,
                    staleDays: 90, // Account considered stale after 90 days
                    action: "log", // "log", "challenge", or "block"
                    notifyUser: true, // Send email to user
                    notifyAdmin: true, // Send email to admin
                    adminEmail: `${process.env.NUXT_PUBLIC_SITE_EMAIL}`,
                },
                botBlocking: {
                    action: "challenge", // "log", "challenge", or "block"
                },
                suspiciousIpBlocking: {
                    action: "block", // "log", "challenge", or "block"
                },
                velocity: {
                    enabled: true,
                    thresholds: {
                        challenge: 10,
                        block: 20,
                    },
                    maxSignupsPerVisitor: 5,
                    maxPasswordResetsPerIp: 10,
                    maxSignInsPerIp: 50,
                    windowSeconds: 3600,
                    action: "challenge",
                },
                emailValidation: {
                    enabled: true,
                    strictness: "medium", // "low", "medium", or "high"
                    action: "block",
                },
                emailNormalization: {
                    enabled: true, // still normalize for deduplication and consistent sign-in
                },
                challengeDifficulty: 18,  // Default difficulty level
            },
        }),
    ],
});