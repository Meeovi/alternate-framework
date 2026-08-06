<template>
    <div class="max-w-md mx-auto p-6">
        <h2 class="text-xl font-bold mb-4">Passkeys</h2>

        <!-- Add New Passkey -->
        <div class="flex gap-2 mb-6">
            <v-text-field v-model="newPasskeyName" label="Passkey name (optional)" placeholder="Passkey name (optional)"
                class="flex-1 px-4 py-2 border rounded" />
            <v-btn @click="addPasskey" :disabled="loading || !session"
                class="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
                {{ loading ? "Adding..." : "Add" }}
            </v-btn>
        </div>

        <!-- Passkeys List -->
        <div v-if="passkeys.length === 0" class="text-gray-500 text-center py-8">
            No passkeys registered
        </div>

        <div v-else class="space-y-3">
            <div v-for="passkey in passkeys" :key="passkey.id"
                class="border rounded p-4 flex justify-between items-center">
                <div>
                    <p class="font-medium">
                        {{ passkey.name || getAuthenticatorName(passkey.aaguid) || "Passkey" }}
                    </p>
                    <p class="text-sm text-gray-500">
                        Created {{ new Date(passkey.createdAt).toLocaleDateString() }}
                    </p>
                </div>
                <v-btn @click="deletePasskey(passkey.id)" class="text-red-600 hover:text-red-800">
                    Delete
                </v-btn>
            </div>
        </div>

        <p v-if="error" class="text-red-500 text-sm mt-4">{{ error }}</p>
    </div>
</template>

<!-- components/PasskeyManager.vue -->
<script setup lang="ts">
    import { useFetch } from "nuxt/app";
    import { ref, onMounted } from "vue";
    import {
            authClient
    } from "../../../../lib/auth-client";
    import {
            getAuthenticatorName
    } from "@better-auth/passkey";
    import type { BetterAuthPasskey } from '../../../types'

    const passkeys = ref<BetterAuthPasskey[]>([]);
    const loading = ref(false);
    const error = ref("");
    const newPasskeyName = ref("");

    const {
            data: sessionData
    } = await useAuth().useSession(useFetch);
    const session = (sessionData as any).value

    async function fetchPasskeys() {
        const {
            data
        } = await authClient.passkey.listUserPasskeys();
        passkeys.value = data || [];
    }

    async function addPasskey() {
        loading.value = true;
        error.value = "";

        const {
            data,
            error: err
        } = await authClient.passkey.addPasskey({
            name: newPasskeyName.value || undefined,
        });

        if (err) {
            error.value = err.message ?? '';
        } else {
            newPasskeyName.value = "";
            await fetchPasskeys();
        }
        loading.value = false;
    }

    async function deletePasskey(id: string) {
        if (!confirm("Delete this passkey?")) return;

        const {
            error: err
        } = await authClient.passkey.deletePasskey({
            id
        });
        if (err) {
            error.value = err.message ?? '';
        } else {
            await fetchPasskeys();
        }
    }

    async function updatePasskeyName(id: string, name: string) {
        const {
            error: err
        } = await authClient.passkey.updatePasskey({
            id,
            name
        });
        if (err) error.value = err.message ?? '';
    }

    onMounted(fetchPasskeys);
</script>