<template>
    <div v-if="shouldRender" class="flex min-h-screen items-center justify-center p-4">
        <v-card class="w-full max-w-md">
            <template>
                <h1 class="text-xl font-semibold">Two-Factor Authentication</h1>
                <p v-if="isSupported" class="text-sm text-muted mt-1">
                    Request a one-time code or use a backup code.
                </p>
            </template>

            <v-alert v-if="!isSupported" color="warning" variant="text" icon="i-lucide-shield-x"
                :description="`Two-factor verification is not available for the current auth backend (${backendLabel}).`" />

            <form v-else class="space-y-4" @submit.prevent="handleVerify">
                <v-alert v-if="error" color="error" variant="text" :description="error" icon="i-lucide-circle-alert" />

                <template v-if="!codeSent && !useBackupCode">
                    <p class="text-sm text-muted">
                        Click below to send a one-time code. In development the code is
                        logged to the server console.
                    </p>
                    <v-btn type="button" block size="md" :loading="sendOtpLoading" @click="handleSendOtp">
                        {{ sendOtpLoading ? "Sending..." : "Send code" }}
                    </v-btn>
                </template>

                <template v-else-if="!useBackupCode">
                    <v-text-field v-model="code" label="Verification code" required type="text" inputmode="numeric"
                        placeholder="Enter the code" size="md" maxlength="6" autocomplete="one-time-code" />
                    <p class="text-xs text-muted">
                        Check the terminal where <code>nr dev</code> is running for the
                        code.
                    </p>
                </template>

                <template v-else>
                    <v-text-field label="Backup code" required v-model="backupCode" type="text"
                        placeholder="Enter a backup code" size="md" autocomplete="one-time-code" />
                </template>

                <label class="flex items-center gap-2 cursor-pointer text-sm">
                    <v-checkbox v-model="trustDevice" />
                    <span>Trust this device for 30 days</span>
                </label>

                <v-btn v-if="codeSent || useBackupCode" type="submit" block size="md" :loading="loading"
                    :trailing="false">
                    {{ loading ? "Verifying..." : "Verify" }}
                </v-btn>

                <p class="text-center text-sm text-muted">
                    <v-btn variant="text" size="sm" class="p-0"
                        @click="useBackupCode = !useBackupCode; codeSent = false; code = ''; backupCode = ''">
                        {{ useBackupCode ? "Send one-time code instead" : "Use a backup code instead" }}
                    </v-btn>
                </p>
            </form>
        </v-card>
    </div>
</template>

<script setup lang="ts">
    import {
        authClient
    } from '../../lib/auth-client'
    import {
        useAuthCapabilities
    } from '../../composables/useAuthCapabilities'

    const props = withDefaults(defineProps < {
        enabled ? : boolean;
        showUnsupportedState ? : boolean;
        redirectTo ? : string;
    } > (), {
        enabled: true,
        showUnsupportedState: false,
        redirectTo: '/dashboard',
    })

    const {
        backend,
        hasTwoFactor
    } = useAuthCapabilities()
    const isSupported = computed(() => hasTwoFactor.value)
    const backendLabel = computed(() => backend.value)
    const shouldRender = computed(() => props.enabled && (isSupported.value || props.showUnsupportedState))

    const code = ref("");
    const backupCode = ref("");
    const useBackupCode = ref(false);
    const error = ref("");
    const loading = ref(false);
    const sendOtpLoading = ref(false);
    const codeSent = ref(false);
    const trustDevice = ref(true);

    async function handleSendOtp() {
        if (!isSupported.value) {
            error.value = "Two-factor verification is not supported by the current auth backend";
            return;
        }
        error.value = "";
        sendOtpLoading.value = true;
        const {
            data,
            error: sendError
        } = await authClient.twoFactor.sendOtp({});
        sendOtpLoading.value = false;
        if (sendError) {
            error.value = sendError.message ?? "Failed to send code";
            return;
        }
        if (data) {
            codeSent.value = true;
        }
    }

    async function handleVerify() {
        if (!isSupported.value) {
            error.value = "Two-factor verification is not supported by the current auth backend";
            return;
        }
        error.value = "";
        loading.value = true;

        const toVerify = useBackupCode.value ?
            backupCode.value.trim() :
            code.value.replace(/\s/g, "");

        if (!toVerify) {
            error.value = useBackupCode.value ?
                "Enter a backup code" :
                "Enter the code";
            loading.value = false;
            return;
        }

        if (useBackupCode.value) {
            const {
                error: verifyError
            } =
            await authClient.twoFactor.verifyBackupCode({
                code: toVerify,
                trustDevice: trustDevice.value,
            });
            if (verifyError) {
                error.value = verifyError.message ?? "Invalid backup code";
                loading.value = false;
                return;
            }
        } else {
            const {
                error: verifyError
            } = await authClient.twoFactor.verifyOtp({
                code: toVerify,
                trustDevice: trustDevice.value,
            });
            if (verifyError) {
                error.value = verifyError.message ?? "Invalid code";
                loading.value = false;
                return;
            }
        }

        window.location.href = props.redirectTo;
    }
</script>