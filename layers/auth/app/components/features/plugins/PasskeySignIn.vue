<template>
    <div>
        <v-btn @click="signInWithPasskey" :loading="loading" :disabled="loading"
            block color="grey-darken-4" size="large" prepend-icon="fas fa-fingerprint">
            {{ loading ? "Signing in..." : "Sign in with Passkey" }}
        </v-btn>

        <p v-if="error" class="text-error text-caption mt-2">{{ error }}</p>

        <!-- For conditional UI autofill -->
        <v-text-field type="text" name="username" autocomplete="username webauthn" placeholder="Username"
            variant="outlined" density="comfortable" hide-details class="mt-4" />
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