import { betterAuth } from "better-auth";
import { oneTimeToken } from "better-auth/plugins/one-time-token";

export const tokenAuth = betterAuth({
    plugins: [
      oneTimeToken()
    ]
});