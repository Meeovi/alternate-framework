<template>
    <section v-if="shouldRender" class="space-y-3">
        <h2 class="font-medium">Organizations</h2>

        <p v-if="!isSupported" class="text-sm text-muted">
            Organization management is not available for the current auth backend ({{ backendLabel }}).
        </p>

        <template v-else>
            <UAlert v-if="error" color="error" variant="soft" :description="error" />
            <UAlert v-if="message" color="success" variant="soft" :description="message" />

            <div v-if="loading" class="text-sm text-muted">Loading organizations...</div>
            <div v-else-if="organizations.length === 0" class="text-sm text-muted">No organizations found.</div>

            <ul v-else class="space-y-2">
                <li v-for="organization in organizations" :key="organization.id" class="flex items-center justify-between gap-2">
                    <span>
                        {{ organization.name }}
                        <span v-if="organization.id === activeOrganizationId" class="text-xs text-muted">(Active)</span>
                    </span>

                    <div class="flex items-center gap-2">
                        <UButton
                            size="xs"
                            variant="soft"
                            :disabled="organization.id === activeOrganizationId || actionLoading"
                            @click="setActive(organization.id)">
                            Set Active
                        </UButton>
                        <UButton
                            size="xs"
                            color="error"
                            variant="outline"
                            :loading="actionLoading"
                            @click="leave(organization.id)">
                            Leave
                        </UButton>
                    </div>
                </li>
            </ul>
        </template>
    </section>
</template>

<script setup lang="ts">
    import { authClient } from '../../lib/auth-client'
    import { useAuthCapabilities } from '../composables/useAuthCapabilities'

    const props = withDefaults(defineProps<{
        enabled?: boolean;
        showUnsupportedState?: boolean;
    }>(), {
        enabled: true,
        showUnsupportedState: false,
    })

    const { backend, hasOrganization } = useAuthCapabilities()
    const isSupported = computed(() => hasOrganization.value)
    const backendLabel = computed(() => backend.value)
    const shouldRender = computed(() => props.enabled && (isSupported.value || props.showUnsupportedState))

    const loading = ref(false)
    const actionLoading = ref(false)
    const error = ref('')
    const message = ref('')
    const organizations = ref<Array<{ id: string; name: string }>>([])

    const activeOrgState = authClient.useActiveOrganization?.()
    const activeOrganizationId = computed(() => activeOrgState?.value?.data?.id || null)

    async function loadOrganizations() {
        if (!isSupported.value) return

        loading.value = true
        error.value = ''
        try {
            const listApi = (authClient as any).organization?.list
            const { data, error: listError } = await listApi({ limit: 50 })
            if (listError) throw listError
            organizations.value = Array.isArray(data) ? data : []
        } catch (err: any) {
            error.value = err?.message || 'Failed to load organizations'
            organizations.value = []
        } finally {
            loading.value = false
        }
    }

    async function setActive(orgId: string) {
        if (!isSupported.value) return

        actionLoading.value = true
        error.value = ''
        message.value = ''
        try {
            await (authClient as any).organization.setActive({ organizationId: orgId })
            message.value = 'Active organization updated'
            await loadOrganizations()
        } catch (err: any) {
            error.value = err?.message || 'Failed to set active organization'
        } finally {
            actionLoading.value = false
        }
    }

    async function leave(orgId: string) {
        if (!isSupported.value) return

        actionLoading.value = true
        error.value = ''
        message.value = ''
        try {
            await (authClient as any).organization.leave({ organizationId: orgId })
            message.value = 'You left the organization'
            await loadOrganizations()
        } catch (err: any) {
            error.value = err?.message || 'Failed to leave organization'
        } finally {
            actionLoading.value = false
        }
    }

    onMounted(loadOrganizations)
</script>