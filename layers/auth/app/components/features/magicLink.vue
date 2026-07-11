<template>
    <div class="max-w-md mx-auto p-6">
        <h2 class="text-xl font-bold mb-4">Sign in with Magic Link</h2>

        <div v-if="status === 'sent'" class="text-center py-8">
            <p class="text-green-600 text-lg">✓ Magic link sent!</p>
            <p class="text-gray-600 mt-2">
                Check your email at <strong>{{ email }}</strong> and click the link to sign in.
            </p>
        </div>

        <form v-else @submit.prevent="sendMagicLink" class="space-y-4">
            <div>
                <v-text-field label="Email" v-model="email" type="email" required placeholder="you@example.com"
                    class="w-full px-4 py-2 border rounded" />
            </div>

            <div>
                <v-text-field label="Name (only for new users)" v-model="name" type="text" placeholder="Your name" class="w-full px-4 py-2 border rounded" />
            </div>

            <v-btn type="submit" :disabled="status === 'sending'"
                class="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50">
                {{ status === "sending" ? "Sending..." : "Send Magic Link" }}
            </v-btn>

            <p v-if="status === 'error'" class="text-red-500 text-sm">
                {{ errorMessage }}
            </p>
        </form>
    </div>
</template>

<script setup lang="ts">
    import {
        authClient
    } from "../../../lib/auth-client";

    const email = ref("");
    const name = ref("");
    const status = ref < "idle" | "sending" | "sent" | "error" > ("idle");
    const errorMessage = ref("");

    async function sendMagicLink() {
        status.value = "sending";

        const {
            error
        } = await authClient.signIn.magicLink({
            email: email.value,
            name: name.value || undefined,
            callbackURL: "/dashboard",
            errorCallbackURL: "/login?error=magic-link",
        });

        if (error) {
            status.value = "error";
            errorMessage.value = error.message;
        } else {
            status.value = "sent";
        }
    }
</script>