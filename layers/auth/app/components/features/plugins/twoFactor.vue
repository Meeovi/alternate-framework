<template>
    <div class="max-w-md mx-auto p-6">
        <h2 class="text-xl font-bold mb-4">Two-Factor Authentication</h2>

        <!-- Enable 2FA Flow -->
        <div v-if="!session?.user.twoFactorEnabled">
            <div v-if="step === 'password'" class="space-y-4">
                <v-text-field v-model="password" type="password" placeholder="Enter your password"
                    class="w-full px-4 py-2 border rounded" />
                <v-btn @click="enable2FA" :disabled="loading" class="w-full bg-blue-600 text-white py-2 rounded">
                    {{ loading ? "Enabling..." : "Enable 2FA" }}
                </v-btn>
                <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
            </div>

            <div v-else-if="step === 'qr'" class="space-y-4">
                <p class="text-sm text-gray-600">
                    Scan this QR code with your authenticator app:
                </p>
                <img v-if="qrDataUrl" :src="qrDataUrl" alt="2FA QR Code" class="mx-auto" />
                <v-text-field v-model="totpCode" type="text" placeholder="Enter 6-digit code" maxlength="6"
                    class="w-full px-4 py-2 border rounded" />
                <v-btn @click="verifyTOTP" :disabled="loading" class="w-full bg-green-600 text-white py-2 rounded">
                    {{ loading ? "Verifying..." : "Verify" }}
                </v-btn>
            </div>

            <div v-else-if="step === 'backup'" class="space-y-4">
                <p class="text-green-600 font-medium">2FA enabled successfully!</p>
                <p class="text-sm text-gray-600">Save these backup codes:</p>
                <div class="bg-gray-100 p-4 rounded font-mono text-sm">
                    <p v-for="code in backupCodes" :key="code">{{ code }}</p>
                </div>
            </div>
        </div>

        <!-- Already Enabled -->
        <div v-else>
            <p class="text-green-600 mb-4">✓ 2FA is enabled</p>
            <v-btn @click="disable2FA" class="w-full bg-red-600 text-white py-2 rounded">
                Disable 2FA
            </v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    import {
        authClient
    } from "../../../../lib/auth-client";
    import { useQRCode } from '@vueuse/integrations'

    const password = ref("");
    const totpCode = ref("");
    const backupCodes = ref < string[] > ([]);
    const step = ref < "password" | "qr" | "backup" | "verify" > ("password");
    const error = ref("");
    const loading = ref(false);
    const session = ref<any>(null)
    const qrText = computed(() => session.value?.data?.totpURI || '')
    const qrDataUrl = useQRCode(qrText)

    const {
        data: sessionData
    } = await useAuth().useSession(useFetch);
    session.value = (sessionData as any).value

    async function enable2FA() {
        loading.value = true;
        error.value = "";

        const {
            data,
            error: err
        } = await authClient.twoFactor.enable({
            password: password.value,
        });

        if (err) {
            error.value = err.message ?? '';
        } else if (data) {
            backupCodes.value = data.backupCodes ?? [];
            step.value = "qr";
        }
        loading.value = false;
    }

    async function verifyTOTP() {
        loading.value = true;
        error.value = "";

        const {
            data,
            error: err
        } = await authClient.twoFactor.verifyTotp({
            code: totpCode.value,
            trustDevice: true,
        });

        if (err) {
            error.value = err.message ?? '';
        } else {
            step.value = "backup";
        }
        loading.value = false;
    }

    async function disable2FA() {
        const {
            error: err
        } = await authClient.twoFactor.disable({
            password: password.value,
        });
        if (err) alert(err.message ?? '');
        else alert("2FA disabled");
    }
</script>