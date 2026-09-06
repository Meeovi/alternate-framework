<template>
    <div class="max-w-3xl mx-auto p-6">
        <v-toolbar flat class="mb-4">
            <v-toolbar-title>Manage Subscription</v-toolbar-title>
            <v-spacer />
            <v-btn
                color="primary"
                variant="tonal"
                :loading="loading"
                @click="loadSubscriptions"
            >
                Refresh
            </v-btn>
        </v-toolbar>

        <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="error = ''"
        >
            {{ error }}
        </v-alert>

        <v-alert
            v-if="message"
            type="success"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="message = ''"
        >
            {{ message }}
        </v-alert>

        <div v-if="loading" class="py-8 text-center text-gray-500">
            Loading your subscriptions…
        </div>

        <v-card
            v-for="sub in subscriptions"
            :key="sub.id"
            class="mb-4"
            variant="outlined"
        >
            <v-card-title class="d-flex align-center">
                <span>{{ planName(sub) }}</span>
                <v-spacer />
                <v-chip
                    :color="statusColor(sub.status)"
                    size="small"
                    variant="flat"
                >
                    {{ sub.status }}
                </v-chip>
            </v-card-title>

            <v-card-text>
                <div class="text-sm text-gray-600 space-y-1">
                    <p><strong>Plan:</strong> {{ planName(sub) }}</p>
                    <p><strong>Billing:</strong> {{ sub.billingInterval === 'year' ? 'Yearly' : 'Monthly' }}</p>
                    <p v-if="sub.seats"><strong>Seats:</strong> {{ sub.seats }}</p>
                    <p v-if="sub.cancelAtPeriodEnd">
                        <strong>Ends:</strong> {{ formatDate(sub.periodEnd) }}
                        <span class="text-amber-600">(cancels at period end)</span>
                    </p>
                    <p v-else-if="sub.status === 'active'">
                        <strong>Renews:</strong> {{ formatDate(sub.periodEnd) }}
                    </p>
                    <p class="text-xs text-gray-400">
                        Exact charges are managed in the Stripe billing portal.
                    </p>
                </div>
            </v-card-text>

            <v-card-actions>
                <v-btn
                    v-if="sub.status === 'active' && !sub.cancelAtPeriodEnd"
                    color="error"
                    variant="text"
                    :loading="actionLoading === sub.id"
                    @click="cancel(sub)"
                >
                    Cancel
                </v-btn>
                <v-btn
                    v-if="sub.cancelAtPeriodEnd"
                    color="success"
                    variant="text"
                    :loading="actionLoading === sub.id"
                    @click="restore(sub)"
                >
                    Restore
                </v-btn>
                <v-btn
                    v-if="sub.status === 'active'"
                    color="primary"
                    variant="text"
                    :loading="actionLoading === sub.id"
                    @click="upgrade(sub)"
                >
                    Change plan
                </v-btn>
                <v-spacer />
                <v-btn
                    color="secondary"
                    variant="text"
                    :loading="portalLoading"
                    @click="openBillingPortal"
                >
                    Billing portal
                </v-btn>
            </v-card-actions>
        </v-card>

        <v-card
            v-if="!loading && subscriptions.length === 0"
            variant="outlined"
            class="text-center py-10 text-gray-500"
        >
            You don't have any active subscriptions yet.
        </v-card>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref } from "vue";
    import {
        authClient
    } from "../../../lib/auth-client";

    interface Subscription {
        id: string;
        plan: string;
        status: string;
        billingInterval?: "month" | "year" | string;
        cancelAtPeriodEnd?: boolean;
        periodEnd?: string | null;
        referenceId?: string | null;
        seats?: number;
    }

    const session = authClient.useSession as any;
    const subscriptions = ref<Subscription[]>([]);
    const loading = ref(false);
    const actionLoading = ref<string | null>(null);
    const portalLoading = ref(false);
    const error = ref("");
    const message = ref("");

    function activeReferenceId(): string | undefined {
        const activeOrg = (session.value?.data?.session as any)?.activeOrganizationId;
        return activeOrg ?? session.value?.data?.user?.id;
    }

    async function loadSubscriptions() {
        loading.value = true;
        error.value = "";
        try {
            const { data, error: listError } = await authClient.subscription.list({
                query: { referenceId: activeReferenceId() }
            });
            if (listError) throw listError;
            subscriptions.value = (data as Subscription[] | undefined) ?? [];
        } catch (err: any) {
            error.value = err?.message || "Failed to load subscriptions";
            subscriptions.value = [];
        } finally {
            loading.value = false;
        }
    }

    async function cancel(sub: Subscription) {
        actionLoading.value = sub.id;
        error.value = "";
        message.value = "";
        try {
            const { error: cancelError } = await authClient.subscription.cancel({
                subscriptionId: sub.id,
                returnUrl: window.location.pathname,
                disableRedirect: true
            });
            if (cancelError) throw cancelError;
            message.value = "Subscription scheduled for cancellation at period end.";
            await loadSubscriptions();
        } catch (err: any) {
            error.value = err?.message || "Failed to cancel subscription";
        } finally {
            actionLoading.value = null;
        }
    }

    async function restore(sub: Subscription) {
        actionLoading.value = sub.id;
        error.value = "";
        message.value = "";
        try {
            const { error: restoreError } = await authClient.subscription.restore({
                subscriptionId: sub.id
            });
            if (restoreError) throw restoreError;
            message.value = "Subscription restored.";
            await loadSubscriptions();
        } catch (err: any) {
            error.value = err?.message || "Failed to restore subscription";
        } finally {
            actionLoading.value = null;
        }
    }

    async function upgrade(sub: Subscription) {
        actionLoading.value = sub.id;
        error.value = "";
        message.value = "";
        const nextPlan = prompt("Enter the plan name to switch to (e.g. pro):");
        if (!nextPlan) {
            actionLoading.value = null;
            return;
        }
        try {
            const { error: upgradeError } = await authClient.subscription.upgrade({
                plan: nextPlan,
                subscriptionId: sub.id,
                referenceId: sub.referenceId ?? activeReferenceId(),
                disableRedirect: true
            } as any);
            if (upgradeError) throw upgradeError;
            message.value = `Upgrade to "${nextPlan}" initiated.`;
            await loadSubscriptions();
        } catch (err: any) {
            error.value = err?.message || "Failed to upgrade subscription";
        } finally {
            actionLoading.value = null;
        }
    }

    async function openBillingPortal() {
        portalLoading.value = true;
        error.value = "";
        try {
            const { error: portalError } = await authClient.subscription.billingPortal({
                returnUrl: window.location.pathname,
                disableRedirect: true
            } as any);
            if (portalError) throw portalError;
            message.value = "Opening Stripe billing portal…";
            await loadSubscriptions();
        } catch (err: any) {
            error.value = err?.message || "Failed to open billing portal";
        } finally {
            portalLoading.value = false;
        }
    }

    function planName(sub: Subscription): string {
        return sub.plan || "Subscription";
    }

    function statusColor(status: string): string {
        switch (status) {
            case "active": return "success";
            case "trialing": return "info";
            case "canceled": return "error";
            case "past_due": return "warning";
            default: return "grey";
        }
    }

    function formatDate(value: string | null | undefined): string {
        if (!value) return "—";
        const d = new Date(value);
        return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
    }

    onMounted(loadSubscriptions);
</script>
