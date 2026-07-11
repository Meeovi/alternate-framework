import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { sendEmail } from "@better-auth/infra";
import { token } from "viem/tempo/actions";

export const auth = betterAuth({
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
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
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
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
        },
      });
    },
  },
  resetPassword: {
    async sendResetPassword({ user, url }: { user: any; url: string }) {
      await sendEmail({
        template: "reset-password",
        to: user.email,
        variables: {
          resetLink: url,
          userEmail: user.email,
          userName: user.name,
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
        },
      });
    },
  },
  signInOtp: {
    enabled: true,
    async sendOtpEmail({ user, otp }: { user: any; otp: string }) {
      await sendEmail({
        template: "sign-in-otp",
        to: user.email,
        variables: {
          otpCode: otp,
          userEmail: user.email,
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
        },
      });
    },
  },
  verifyEmailOtp: {
    enabled: true,
    async sendOtpEmail({ user, otp }: { user: any; otp: string }) {
      await sendEmail({
        template: "verify-email-otp",
        to: user.email,
        variables: {
          otpCode: otp,
          userEmail: user.email,
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
          expirationMinutes: "10"
        },
      });
    },
  },
  resetPasswordOtp: {
    enabled: true,
    async sendOtpEmail({ user, otp }: { user: any; otp: string }) {
      await sendEmail({
        template: "reset-password-otp",
        to: user.email,
        variables: {
          otpCode: otp,
          userEmail: user.email,
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
          expirationMinutes: "15"
        },
      });
    },
  },
  magicLink: {
    enabled: true,
    async sendMagicLinkEmail({ user, url }: { user: any; url: string }) {
      await sendEmail({
        template: "magic-link",
        to: user.email,
        variables: {
          magicLink: `${url}auth/magic?token=${token}`,
          userEmail: user.email,
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
        },
      });
    },
  },
  twoFactor: {
    enabled: true,
    async send2faCode({ user, code }: { user: any; code: string }) {
      await sendEmail({
        template: "two-factor",
        to: user.email,
        variables: {
          otpCode: code,
          userEmail: user.email,
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
          expirationMinutes: "5"
        },
      });
    },
  },
  invitation: {
    enabled: true,
    async sendInvitationEmail({ user, url }: { user: any; url: string }) {
      await sendEmail({
        template: "invitation",
        to: user.email,
        variables: {
          inviteLink: url,
          inviterName: user.name,
          inviterEmail: user.email,
          organizationName: user.organization?.name || "Your Organization",
          role: user.role || "Member",
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
        },
      });
    },
  },
  applicationInvite: {
    enabled: true,
    async sendApplicationInviteEmail({ user, url }: { user: any; url: string }) {
      await sendEmail({
        template: "application-invite",
        to: user.email,
        variables: {
          inviteLink: url,
          inviterName: user.name,
          inviterEmail: user.email,
          inviteeEmail: user.email,
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
        },
      });
    },
  },
  deleteAccount: {
    enabled: true,
    async sendAccountDeletionEmail({ user }: { user: any }) {
      await sendEmail({
        template: "delete-account",
        to: user.email,
        variables: {
          deletionLink: `${process.env.NUXT_PUBLIC_SITE_URL}/delete-account/${user.id}`,
          userEmail: user.email,
          userName: user.name,
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
          expirationMinutes: "60"
        },
      });
    },
  },
  staleAccountUser: {
    enabled: true,
    async sendStaleAccountUserEmail({ user }: { user: any }) {
      await sendEmail({
        template: "stale-account-user",
        to: user.email,
        variables: {
          userEmail: user.email,
          daysSinceLastActive: "90",
          loginTime: "February 20, 2026, 3:45 PM UTC",
          userName: user.name,
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
          loginLocation: "New York, US",
          loginDevice: "Chrome on Windows",
          loginIp: "192.168.1.1",
        },
      });
    },
  },
  staleAccountAdmin: {
    enabled: true,
    async sendStaleAccountAdminEmail({ user }: { user: any }) {
      await sendEmail({
        template: "stale-account-admin",
        to: process.env.ADMIN_EMAIL || "admin@example.com",
        variables: {
          userEmail: user.email,
          userId: user.id,
          adminEmail: process.env.ADMIN_EMAIL || "admin@example.com",
          daysSinceLastActive: "90",
          loginTime: "February 20, 2026, 3:45 PM UTC",
          userName: user.name,
          appName: `${process.env.NUXT_APP_NAME || "Your App"}`,
          loginLocation: "New York, US",
          loginDevice: "Chrome on Windows",
          loginIp: "192.168.1.1",
        },
      });
    },
  },
  plugins: [
    organization({
      async sendInvitationEmail(data: any) {
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
            appName: "Your App",
          },
        });
      },
    }),
  ],
});