<template>
    <div>
        <v-btn @click="signInWithPasskey" :disabled="loading"
            class="w-full bg-gray-900 text-white py-2 rounded flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            {{ loading ? "Signing in..." : "Sign in with Passkey" }}
        </v-btn>

        <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>

        <!-- For conditional UI autofill -->
        <v-text-field type="text" name="username" autocomplete="username webauthn" placeholder="Username"
            class="w-full px-4 py-2 border rounded mt-4" />
    </div>
</template>

<script setup lang="ts">
    import {
        authClient
    } from "../../../../lib/auth-client";

    const loading = ref(false);
    const error = ref("");

    // Enable conditional UI autofill on mount
    onMounted(async () => {
        if (
            typeof PublicKeyCredential !== "undefined" &&
            PublicKeyCredential.isConditionalMediationAvailable
        ) {
            const available = await PublicKeyCredential.isConditionalMediationAvailable()
            if (available) {
                authClient.signIn.passkey({
                    autoFill: true
                });
            }
        }
    });

    async function signInWithPasskey() {
        loading.value = true;
        error.value = "";

        const {
            data,
            error: err
        } = await authClient.signIn.passkey({
            autoFill: false,
        });

        if (err) {
            error.value = err.message ?? '';
            loading.value = false;
        } else {
            navigateTo("/dashboard");
        }
    }
</script>