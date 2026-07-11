import {
    betterAuth
} from "better-auth";
import {
    phoneNumber
} from "better-auth/plugins";
import {
    dash,
    sendSMS,
    createSMSSender
} from "@better-auth/infra";

export const smsSender = createSMSSender({
    apiKey: process.env.BETTER_AUTH_API_KEY,
    apiUrl: process.env.BETTER_AUTH_API_URL,
});

export const smsAuth = betterAuth({
    plugins: [
        phoneNumber({
            sendOTP: async ({
                phoneNumber,
                code
            }) => {
                // This is handled automatically when dash() is configured
                // But you can customize if needed:
                const result = await smsSender.send({
                    to: phoneNumber,
                    code,
                    template: "phone-verification",
                });
                if (result.success) {
                    console.log("SMS sent:", result.messageId);
                } else {
                    console.error("Failed to send SMS:", result.error);
                }
                const twoFactorError = await smsSender.send({
                    to: phoneNumber,
                    code,
                    template: "two-factor",
                });
                if (twoFactorError.success) {
                    console.log("SMS sent:", twoFactorError.messageId);
                } else {
                    console.error("Failed to send SMS:", twoFactorError.error);
                }
                const signInOtpError = await smsSender.send({
                    to: phoneNumber,
                    code,
                    template: "sign-in-otp",
                });
                if (signInOtpError.success) {
                    console.log("SMS sent:", signInOtpError.messageId);
                } else {
                    console.error("Failed to send SMS:", signInOtpError.error);
                }
            },
        }),
        dash({
            apiKey: process.env.BETTER_AUTH_API_KEY,
        }),
    ],
});