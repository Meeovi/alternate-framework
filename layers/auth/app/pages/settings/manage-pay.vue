<template>
    <div class="max-w-3xl mx-auto p-6">
        <v-toolbar flat class="mb-4">
            <v-toolbar-title>Manage your Pay</v-toolbar-title>
            <v-spacer />
            <v-btn color="primary" variant="tonal" :loading="loading" @click="refresh">
                Refresh
            </v-btn>
        </v-toolbar>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">
            {{ error }}
        </v-alert>

        <!-- Not connected state -->
        <v-card v-if="!connected && !loading" variant="outlined" class="text-center py-10">
            <v-card-title class="justify-center">
                No connected Stripe account
            </v-card-title>
            <v-card-text class="text-gray-600">
                You need to connect a Stripe account to receive payouts.
                Contact support to complete onboarding.
            </v-card-text>
        </v-card>

        <template v-else>
            <!-- Balance -->
            <v-card class="mb-6" variant="outlined">
                <v-card-title>Balance</v-card-title>
                <v-card-text>
                    <div v-if="balance" class="d-flex flex-wrap gap-6">
                        <div>
                            <div class="text-sm text-gray-500">Available</div>
                            <div class="text-h5 font-weight-bold">
                                {{ formatBalance(balance.available) }}
                            </div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Pending</div>
                            <div class="text-h5 font-weight-bold">
                                {{ formatBalance(balance.pending) }}
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-gray-500">
                        No balance information available.
                    </div>
                </v-card-text>
            </v-card>

            <!-- Payouts -->
            <v-card variant="outlined">
                <v-card-title class="d-flex align-center">
                    Payouts
                    <v-spacer />
                    <v-btn color="primary" variant="text" :loading="dashboardLoading" @click="openDashboard">
                        Open Stripe Dashboard
                    </v-btn>
                </v-card-title>

                <v-data-table v-if="payouts.length" :headers="payoutHeaders" :items="payouts" :loading="loading"
                    class="elevation-0">
                    <template #item.amount="{ item }">
                        {{ formatPayoutAmount(item.amount, item.currency) }}
                    </template>
                    <template #item.status="{ item }">
                        <v-chip :color="payoutStatusColor(item.status)" size="small" variant="flat">
                            {{ item.status }}
                        </v-chip>
                    </template>
                    <template #item.createdAt="{ item }">
                        {{ formatDate(item.created) }}
                    </template>
                </v-data-table>

                <v-card-text v-else class="text-center text-gray-500">
                    No payouts yet.
                </v-card-text>
            </v-card>
        </template>
    </div>
</template>

<script setup lang="ts">
    import {
        onMounted,
        ref
    } from "vue";
    import {
        useHead
    } from "nuxt/app";
    import {
        authClient
    } from "../../../lib/auth-client";

    useHead({
        title: "Manage your Pay"
    });

    interface Balance {
        available: {
            amount: number;currency: string
        } [];
        pending: {
            amount: number;currency: string
        } [];
    }

    interface Payout {
        id: string;
        amount: number;
        currency: string;
        status: string;
        created: number;
        arrival_date: number;
    }

    const session = authClient.useSession as any;
    const connected = ref(false);
    const loading = ref(false);
    const dashboardLoading = ref(false);
    const error = ref("");
    const balance = ref < Balance | null > (null);
    const payouts = ref < Payout[] > ([]);

    const payoutHeaders = [{
            title: "Amount",
            key: "amount"
        },
        {
            title: "Status",
            key: "status"
        },
        {
            title: "Date",
            key: "createdAt"
        },
    ];

    async function refresh() {
        loading.value = true;
        error.value = "";
        try {
            const [balRes, payRes] = await Promise.all([
                $fetch("/api/payment/stripe/balance") as any,
                $fetch("/api/payment/stripe/payouts") as any,
            ]);
            balance.value = balRes?.balance ?? null;
            payouts.value = payRes?.payouts ?? [];
            connected.value = balRes?.connected ?? false;
        } catch (err: any) {
            const fetchError = err as any;
            error.value = fetchError?.data?.message || fetchError?.statusMessage || "Failed to load payout data";
        } finally {
            loading.value = false;
        }
    }

    async function openDashboard() {
        dashboardLoading.value = true;
        error.value = "";
        try {
            const res = await $fetch("/api/payment/stripe/account-link", {
                method: "POST",
            }) as any;
            if (res?.url) window.location.href = res.url;
        } catch (err: any) {
            error.value = err?.statusMessage || "Failed to open Stripe dashboard";
        } finally {
            dashboardLoading.value = false;
        }
    }

    function formatBalance(items: {
        amount: number;currency: string
    } []): string {
        if (!items?.length) return "$0.00";
        const item = items[0] !;
        const value = item.amount / 100;
        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: item.currency?.toUpperCase() || "USD",
            }).format(value);
        } catch {
            return `${item.currency || "USD"} ${value}`;
        }
    }

    function formatPayoutAmount(amount: number | undefined, currency: string | undefined): string {
        const value = (amount ?? 0) / 100;
        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: currency?.toUpperCase() || "USD",
            }).format(value);
        } catch {
            return `${currency || "USD"} ${value}`;
        }
    }

    function payoutStatusColor(status: string | undefined): string {
        switch (status) {
            case "paid":
                return "success";
            case "pending":
                return "info";
            case "in_transit":
                return "warning";
            case "failed":
                return "error";
            case "canceled":
                return "grey";
            default:
                return "grey";
        }
    }

    function formatDate(timestamp: number | undefined): string {
        if (!timestamp) return "—";
        return new Date(timestamp * 1000).toLocaleDateString();
    }

    onMounted(refresh);
</script>