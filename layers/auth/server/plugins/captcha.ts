import { betterAuth } from "better-auth";
import { captcha } from "better-auth/plugins";

export const captchaAuth = betterAuth({
    plugins: [ 
        captcha({ 
            provider: "cloudflare-turnstile", // or google-recaptcha, hcaptcha, captchafox
            secretKey: process.env.TURNSTILE_SECRET_KEY!, 
        }), 
    ], 
});

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
