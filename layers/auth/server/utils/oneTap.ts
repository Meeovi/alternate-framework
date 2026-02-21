import { betterAuth } from "better-auth";
import { oneTap } from "better-auth/plugins"; 

export const oneTapAuth = betterAuth({
    plugins: [ 
        oneTap(), // Add the One Tap server plugin
    ] 
});