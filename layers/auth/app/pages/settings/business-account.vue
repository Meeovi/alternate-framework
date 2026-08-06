<template>
    <div class="max-w-3xl mx-auto p-6">
        <v-toolbar flat class="mb-4">
            <v-toolbar-title>Business Account Settings</v-toolbar-title>
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

        <!-- Create a new business account (organization) -->
        <v-card class="mb-6" variant="outlined">
            <v-card-title>Create a business account</v-card-title>
            <v-card-text>
                <v-text-field
                    v-model="newName"
                    label="Organization name"
                    placeholder="Acme Inc."
                    :disabled="creating"
                />
                <v-text-field
                    v-model="newSlug"
                    label="Slug"
                    placeholder="acme-inc"
                    hint="Used in URLs and must be unique"
                    :disabled="creating"
                />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn
                    color="primary"
                    :loading="creating"
                    :disabled="!newName || !newSlug"
                    @click="createOrg"
                >
                    Create organization
                </v-btn>
            </v-card-actions>
        </v-card>

        <!-- List of organizations -->
        <v-card class="mb-6" variant="outlined">
            <v-card-title class="d-flex align-center">
                Your organizations
                <v-spacer />
                <v-btn
                    size="small"
                    variant="text"
                    :loading="loadingOrgs"
                    @click="loadOrganizations"
                >
                    Refresh
                </v-btn>
            </v-card-title>
            <v-list v-if="organizations.length">
                <v-list-item
                    v-for="org in organizations"
                    :key="org.id"
                    :active="org.id === activeOrganizationId"
                    @click="setActive(org.id)"
                >
                    <v-list-item-title>{{ org.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ org.slug }}</v-list-item-subtitle>
                    <template #append>
                        <v-chip
                            v-if="org.id === activeOrganizationId"
                            color="primary"
                            size="small"
                            variant="flat"
                        >
                            Active
                        </v-chip>
                    </template>
                </v-list-item>
            </v-list>
            <v-card-text v-else class="text-center text-gray-500">
                You are not a member of any organization yet.
            </v-card-text>
        </v-card>

        <!-- Members of the active organization -->
        <v-card v-if="activeOrganizationId" class="mb-6" variant="outlined">
            <v-card-title class="d-flex align-center">
                Members
                <v-spacer />
                <v-btn
                    size="small"
                    variant="text"
                    :loading="loadingMembers"
                    @click="loadMembers"
                >
                    Refresh
                </v-btn>
            </v-card-title>

            <v-list v-if="members.length">
                <v-list-item v-for="m in members" :key="m.id">
                    <v-list-item-title>
                        {{ m.user?.name || m.user?.email || m.userId }}
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ m.role }}</v-list-item-subtitle>
                    <template #append>
                        <v-chip
                            v-if="m.userId === sessionUser?.id"
                            size="small"
                            variant="flat"
                            color="grey"
                        >
                            You
                        </v-chip>
                        <v-btn
                            v-else
                            size="small"
                            variant="text"
                            color="error"
                            :loading="removingId === m.id"
                            @click="removeMember(m)"
                        >
                            Remove
                        </v-btn>
                    </template>
                </v-list-item>
            </v-list>
            <v-card-text v-else class="text-center text-gray-500">
                No members found.
            </v-card-text>

            <v-divider />

            <v-card-text>
                <div class="d-flex gap-2">
                    <v-text-field
                        v-model="inviteEmail"
                        label="Invite by email"
                        placeholder="member@example.com"
                        hide-details
                        density="comfortable"
                        class="flex-1"
                    />
                    <v-select
                        v-model="inviteRole"
                        :items="['admin', 'member']"
                        label="Role"
                        density="comfortable"
                        hide-details
                        class="flex-0"
                        style="max-width: 160px"
                    />
                    <v-btn
                        color="primary"
                        :loading="inviting"
                        :disabled="!inviteEmail"
                        @click="invite"
                    >
                        Invite
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, ref } from "vue";
    import {
        authClient
    } from "../../../lib/auth-client";
    import { useHead } from "nuxt/app";

    useHead({
        title: "Business Account Settings"
    });

    interface Organization {
        id: string;
        name: string;
        slug: string;
        logo?: string | null;
        metadata?: any;
        createdAt?: Date;
    }

    interface Member {
        id: string;
        userId: string;
        organizationId: string;
        role: string;
        createdAt?: string;
        user?: { id: string; name?: string; email?: string } | null;
    }

    const session = authClient.useSession as any;
    const organizations = ref<Organization[]>([]);
    const activeOrganizationId = ref<string | null>(null);

    const sessionUser = computed(() => session.value?.data?.user);

    const loadingOrgs = ref(false);
    const loadingMembers = ref(false);
    const creating = ref(false);
    const inviting = ref(false);
    const removingId = ref<string | null>(null);
    const error = ref("");
    const message = ref("");

    const newName = ref("");
    const newSlug = ref("");

    const members = ref<Member[]>([]);
    const inviteEmail = ref("");
    const inviteRole = ref<"admin" | "member">("member");

    async function loadOrganizations() {
        loadingOrgs.value = true;
        error.value = "";
        try {
            const { data, error: listError } = await authClient.organization.list();
            if (listError) throw listError;
            organizations.value = (data as Organization[] | undefined) ?? [];
            const active = session.value?.data?.session?.activeOrganizationId;
            if (active) activeOrganizationId.value = active;
            if (activeOrganizationId.value) await loadMembers();
        } catch (err: any) {
            error.value = err?.message || "Failed to load organizations";
        } finally {
            loadingOrgs.value = false;
        }
    }

    async function createOrg() {
        creating.value = true;
        error.value = "";
        message.value = "";
        try {
            const { data, error: createError } = await authClient.organization.create({
                name: newName.value,
                slug: newSlug.value
            });
            if (createError) throw createError;
            message.value = `Organization "${newName.value}" created.`;
            newName.value = "";
            newSlug.value = "";
            await loadOrganizations();
        } catch (err: any) {
            error.value = err?.message || "Failed to create organization";
        } finally {
            creating.value = false;
        }
    }

    async function setActive(organizationId: string) {
        error.value = "";
        message.value = "";
        try {
            const { error: setError } = await authClient.organization.setActive({
                organizationId
            });
            if (setError) throw setError;
            activeOrganizationId.value = organizationId;
            message.value = "Active organization updated.";
            await loadMembers();
        } catch (err: any) {
            error.value = err?.message || "Failed to set active organization";
        }
    }

    async function loadMembers() {
        if (!activeOrganizationId.value) return;
        loadingMembers.value = true;
        error.value = "";
        try {
            const { data, error: listError } = await authClient.organization.listMembers({
                query: { organizationId: activeOrganizationId.value }
            });
            if (listError) throw listError;
            members.value = (data as any) ?? [];
        } catch (err: any) {
            error.value = err?.message || "Failed to load members";
            members.value = [];
        } finally {
            loadingMembers.value = false;
        }
    }

    async function invite() {
        if (!activeOrganizationId.value) return;
        inviting.value = true;
        error.value = "";
        message.value = "";
        try {
            const { error: inviteError } = await authClient.organization.inviteMember({
                email: inviteEmail.value,
                role: inviteRole.value,
                organizationId: activeOrganizationId.value
            });
            if (inviteError) throw inviteError;
            message.value = `Invitation sent to ${inviteEmail.value}.`;
            inviteEmail.value = "";
            await loadMembers();
        } catch (err: any) {
            error.value = err?.message || "Failed to invite member";
        } finally {
            inviting.value = false;
        }
    }

    async function removeMember(m: Member) {
        removingId.value = m.id;
        error.value = "";
        message.value = "";
        try {
            const { error: removeError } = await authClient.organization.removeMember({
                memberIdOrId: m.id,
                organizationId: activeOrganizationId.value!
            } as any);
            if (removeError) throw removeError;
            message.value = "Member removed.";
            await loadMembers();
        } catch (err: any) {
            error.value = err?.message || "Failed to remove member";
        } finally {
            removingId.value = null;
        }
    }

    onMounted(loadOrganizations);
</script>
