import { betterAuth } from "better-auth"
import { i18n } from "@better-auth/i18n"

export const i18nAuth = betterAuth({
    user: {
        additionalFields: {
            locale: { type: "string", required: false },
        },
    },
    plugins: [
        i18n({
            translations: {
                fr: {
                    USER_NOT_FOUND: "Utilisateur non trouvé",
                    INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe invalide",
                    INVALID_PASSWORD: "Mot de passe invalide",
                },
                de: {
                    USER_NOT_FOUND: "Benutzer nicht gefunden",
                    INVALID_EMAIL_OR_PASSWORD: "Ungültige E-Mail oder Passwort",
                    INVALID_PASSWORD: "Ungültiges Passwort",
                },
            },
            detection: ["cookie", "header", "session"], // Priority order
        }),
    ],
})