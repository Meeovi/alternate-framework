<template>
    <div v-if="shouldRender" class="border-t border-default pt-4 space-y-4">
        <h2 class="font-medium">Two-Factor Authentication</h2>
        <p v-if="!isSupported" class="text-sm text-muted">
            Two-factor authentication is not available for the current auth backend ({{ backendLabel }}).
        </p>
        <p v-if="isSupported && has2FA" class="text-sm text-muted">
            2FA is enabled. You will be asked for a code when signing in.
        </p>
        <p v-else-if="isSupported" class="text-sm text-muted">
            Add an extra layer of security by enabling 2FA.
        </p>

        <template v-if="isSupported && enableResult">
            <!-- Just enabled: show backup codes and Done -->
            <p class="text-sm font-medium text-green-600 dark:text-green-400">
                2FA enabled with OTP.
            </p>
            <p class="text-sm text-muted">Save your backup codes:</p>
            <ul class="text-sm text-muted list-disc list-inside">
                <li v-for="(c, i) in enableResult.backupCodes" :key="i">{{ c }}</li>
            </ul>
            <v-btn block size="md" @click="dismissEnableSuccess">Done</v-btn>
        </template>
        <template v-else-if="isSupported && !has2FA">
            <!-- Enable form: password + Enable 2FA -->
            <v-formField label="Your password" required>
                <UInput v-model="twoFactorPassword" type="password" placeholder="Password"
                    @keydown.enter="startEnable2FA" />
            </v-formField>
            <UAlert v-if="twoFactorError" color="error" variant="soft" :description="twoFactorError" />
            <v-btn block size="md" :loading="twoFactorLoading" @click="startEnable2FA">Enable 2FA</v-btn>
        </template>
        <template v-else-if="isSupported">
            <!-- Disable form: password + Disable 2FA -->
            <v-formField label="Your password" required>
                <UInput v-model="disablePassword" type="password" placeholder="Password to disable 2FA"
                    @keydown.enter="handleDisable2FA" />
            </v-formField>
            <UAlert v-if="disableError" color="error" variant="soft" :description="disableError" />
            <v-btn block size="md" color="error" variant="outline" :loading="disableLoading"
                @click="handleDisable2FA">
                Disable 2FA</v-btn>
        </template>
    </div>

    <!-- Footer: sign out clears sessionStorage then signs out -->
    <template v-if="showSignOut && shouldRender" #footer>
        <v-btn color="neutral" variant="outline" block @click="handleSignOut">Sign Out</v-btn>
    </template>
</template>
<script setup lang="ts">
    import { authClient } from '../../../lib/auth-client'
    import { useAuthCapabilities } from '../../composables/useAuthCapabilities'

    const props = withDefaults(defineProps<{
        enabled?: boolean;
        showUnsupportedState?: boolean;
        showSignOut?: boolean;
    }>(), {
        enabled: true,
        showUnsupportedState: false,
        showSignOut: true,
    })

    const { backend, hasTwoFactor } = useAuthCapabilities()
    const session = authClient.useSession();
    const isSupported = computed(() => hasTwoFactor.value)
    const backendLabel = computed(() => backend.value)
    const shouldRender = computed(() => props.enabled && (isSupported.value || props.showUnsupportedState))

    // --- 2FA state ---
    const twoFactorPassword = ref("");
    const twoFactorError = ref("");
    const twoFactorLoading = ref(false);
    const enableResult = ref < {
        backupCodes: string[]
    } | null > (null);
    const disablePassword = ref("");
    const disableError = ref("");
    const disableLoading = ref(false);

    // useSession() returns a Ref<{ data: { user, session }, isPending, ... }>
    const sessionRef = session as Ref < {
        data ? : {
            user ? : {
                twoFactorEnabled ? : boolean
            }
        } | null;
    } > ;
    const user = computed(() => sessionRef.value?.data?.user);

    // 2FA is "on" if the session says so, we just enabled it (enableResult), or we stored it in sessionStorage
    // (session may not return twoFactorEnabled immediately; sessionStorage survives until disable/sign out)
    const has2FA = computed(
        () =>
        !!user.value?.twoFactorEnabled ||
        !!enableResult.value ||
        (import.meta.client && sessionStorage.getItem("2fa-enabled") === "true"),
    );

    // Clear 2fa-enabled before sign out so the next user doesn't see 2FA as enabled
    async function handleSignOut() {
        if (import.meta.client) {
            sessionStorage.removeItem("2fa-enabled");
        }
        await authClient.signOut();
        // Invalidate cached session so middleware's useSession(useFetch) refetches
        await clearNuxtData();
        navigateTo("/login");
    }

    // Enable 2FA: password → enable() → backup codes; then persist "2fa-enabled" and show success UI
    async function startEnable2FA() {
        if (!isSupported.value) {
            twoFactorError.value = "Two-factor authentication is not supported by the current auth backend";
            return;
        }
        if (!twoFactorPassword.value) {
            twoFactorError.value = "Enter your password";
            return;
        }
        twoFactorError.value = "";
        twoFactorLoading.value = true;
        const {
            data,
            error
        } = await authClient.twoFactor.enable({
            password: twoFactorPassword.value,
        });
        twoFactorLoading.value = false;
        if (error) {
            twoFactorError.value = error.message ?? "Failed to enable 2FA";
            return;
        }
        if (data?.backupCodes) {
            enableResult.value = {
                backupCodes: data.backupCodes
            };
            twoFactorPassword.value = "";
            if (import.meta.client) {
                sessionStorage.setItem("2fa-enabled", "true");
            }
        }
    }

    // After showing backup codes, "Done" clears state and reloads so the UI shows "2FA is enabled"
    function dismissEnableSuccess() {
        enableResult.value = null;
        window.location.reload();
    }

    // Disable 2FA: password → disable() → clear sessionStorage and reload
    async function handleDisable2FA() {
        if (!isSupported.value) {
            disableError.value = "Two-factor authentication is not supported by the current auth backend";
            return;
        }
        if (!disablePassword.value) {
            disableError.value = "Enter your password";
            return;
        }
        disableError.value = "";
        disableLoading.value = true;
        const {
            error
        } = await authClient.twoFactor.disable({
            password: disablePassword.value,
        });
        disableLoading.value = false;
        if (error) {
            disableError.value = error.message ?? "Failed to disable 2FA";
            return;
        }
        disablePassword.value = "";
        if (import.meta.client) {
            sessionStorage.removeItem("2fa-enabled");
        }
        window.location.reload();
    }
</script>