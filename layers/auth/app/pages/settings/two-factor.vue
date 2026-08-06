<template>
    <div class="max-w-md mx-auto p-6">
        <h1 class="text-2xl font-bold mb-6">Two-Factor Verification</h1>

        <div class="flex gap-2 mb-4">
            <v-btn v-for="m in ['totp', 'otp', 'backup']" :key="m" @click="method = m"
                :class="{ 'bg-blue-600 text-white': method === m }" class="px-4 py-2 rounded border">
                {{ m.toUpperCase() }}
            </v-btn>
        </div>

        <div class="space-y-4">
            <v-text-field v-model="code" type="text" :placeholder="method === 'backup' ? 'Backup code' : '6-digit code'"
                :maxlength="method === 'backup' ? 10 : 6" class="w-full px-4 py-2 border rounded" />

            <v-btn v-if="method === 'otp'" @click="sendOTP" class="text-blue-600 text-sm">
                Send OTP to email
            </v-btn>

            <v-btn @click="verify" :disabled="loading" class="w-full bg-blue-600 text-white py-2 rounded">
                {{ loading ? "Verifying..." : "Verify" }}
            </v-btn>

            <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { navigateTo } from "nuxt/app";
import { ref } from "vue";
import {
        authClient
    } from "../../../lib/auth-client";

    const code = ref("");
    const method = ref < "totp" | "otp" | "backup" > ("totp");
    const error = ref("");
    const loading = ref(false);

    async function verify() {
        loading.value = true;
        error.value = "";

        let res;
        if (method.value === "totp") {
            res = await authClient.twoFactor.verifyTotp({
                code: code.value,
                trustDevice: true,
            });
        } else if (method.value === "otp") {
            res = await authClient.twoFactor.verifyOtp({
                code: code.value,
                trustDevice: true,
            });
        } else {
            res = await authClient.twoFactor.verifyBackupCode({
                code: code.value,
                trustDevice: true,
            });
        }

        if (res.error) {
            error.value = res.error.message ?? '';
        } else {
            navigateTo("/dashboard");
        }
        loading.value = false;
    }

    async function sendOTP() {
        await (authClient as any).twoFactor.sendOtp({
            trustDevice: true
        } as any);
        method.value = "otp";
    }
</script>