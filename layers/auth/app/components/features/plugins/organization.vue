<template>
    <section class="pa-4">
        <h2 class="text-h5 mb-4">Organizations</h2>

        <!-- Alerts -->
        <v-alert v-if="error" type="error" variant="tonal" class="mb-3">
            {{ error }}
        </v-alert>

        <v-alert v-if="message" type="success" variant="tonal" class="mb-3">
            {{ message }}
        </v-alert>

        <!-- Create Organization -->
        <v-card class="mb-4 pa-4">
            <v-text-field v-model="newOrgName" label="New Organization Name" variant="outlined" />
            <v-btn color="primary" :loading="actionLoading" @click="createOrganization(newOrgName)">
                Create Organization
            </v-btn>
        </v-card>

        <!-- Organizations List -->
        <div v-if="loading" class="text-body-2 text-grey">Loading organizations...</div>

        <div v-else-if="orgList.length === 0" class="text-body-2 text-grey">
            No organizations found.
        </div>

        <v-list v-else>
            <v-list-item v-for="org in orgList" :key="org.id" class="d-flex justify-space-between align-center">
                <div>
                    <strong>{{ org.name }}</strong>
                    <span v-if="org.id === activeOrg" class="text-caption text-grey">
                        (Active)
                    </span>
                </div>

                <div class="d-flex gap-2">
                    <v-btn size="small" variant="tonal" :disabled="org.id === activeOrg || actionLoading"
                        @click="setActive(org.id)">
                        Set Active
                    </v-btn>

                    <v-btn size="small" color="error" variant="outlined" :loading="actionLoading"
                        @click="leave(org.id)">
                        Leave
                    </v-btn>

                    <v-btn size="small" variant="outlined" @click="openOrganizationManager(org)">
                        Manage
                    </v-btn>
                </div>
            </v-list-item>
        </v-list>

        <!-- ROLE CREATE DIALOG -->
        <v-dialog v-model="roleCreateDialog" max-width="500">
            <v-card class="pa-4">
                <h3 class="text-h6 mb-4">Create Role</h3>

                <v-text-field v-model="roleNameInput" label="Role Name" variant="outlined" />

                <v-textarea v-model="rolePermissionInput" label="Permission JSON" variant="outlined"
                    hint="Example: { project: ['create', 'update'] }" />

                <v-btn color="primary" class="mt-4" @click="uiCreateRole">
                    Create
                </v-btn>
            </v-card>
        </v-dialog>

        <!-- ROLE EDIT DIALOG -->
        <v-dialog v-model="roleEditDialog" max-width="500">
            <v-card class="pa-4">
                <h3 class="text-h6 mb-4">Edit Role</h3>

                <v-text-field v-model="roleNameInput" label="Role Name" variant="outlined" />

                <v-textarea v-model="rolePermissionInput" label="Permission JSON" variant="outlined" />

                <v-btn color="primary" class="mt-4" @click="uiUpdateRole">
                    Save Changes
                </v-btn>
            </v-card>
        </v-dialog>

        <!-- TEAM CREATE DIALOG -->
        <v-dialog v-model="teamCreateDialog" max-width="500">
            <v-card class="pa-4">
                <h3 class="text-h6 mb-4">Create Team</h3>

                <v-text-field v-model="teamNameInput" label="Team Name" variant="outlined" />

                <v-btn color="primary" class="mt-4" @click="uiCreateTeam">
                    Create
                </v-btn>
            </v-card>
        </v-dialog>

        <!-- TEAM EDIT DIALOG -->
        <v-dialog v-model="teamEditDialog" max-width="500">
            <v-card class="pa-4">
                <h3 class="text-h6 mb-4">Edit Team</h3>

                <v-text-field v-model="teamNameInput" label="Team Name" variant="outlined" />

                <v-btn color="primary" class="mt-4" @click="uiUpdateTeam">
                    Save Changes
                </v-btn>
            </v-card>
        </v-dialog>
    </section>
</template>

<script setup lang="ts">
    import {
        ref,
        computed,
        onMounted
    } from 'vue'
    import {
        useOrganization
    } from '../../../composables/organization/useOrganization'

    const {
        organizations,
        activeOrganizationId,
        loading,
        actionLoading,
        error,
        message,

        loadOrganizations,
        createOrganization,
        setActive,
        leave,

        listRoles,
        createRole,
        updateRole,
        deleteRole,

        listTeams,
        createTeam,
        updateTeam,
        removeTeam,

        listTeamMembers,
        removeTeamMember,
        inviteMember,
    } = useOrganization()

    // ---------------------------
    // SAFE COMPUTED LISTS
    // ---------------------------
    const orgList = computed(() => organizations.value?.data || [])
    const activeOrg = computed(() => activeOrganizationId.value)

    // ---------------------------
    // UI STATE
    // ---------------------------
    const newOrgName = ref('')
    const drawer = ref(false)
    const selectedOrg = ref < any > (null)

    // Roles
    const roleList = ref < any[] > ([])
    const roleNameInput = ref('')
    const rolePermissionInput = ref('')
    const selectedRole = ref < any > (null)

    // Teams
    const teamList = ref < any[] > ([])
    const teamNameInput = ref('')
    const selectedTeam = ref < any > (null)

    // Members
    const memberList = ref < any[] > ([])
    const inviteEmailInput = ref('')

    // Dialogs
    const roleCreateDialog = ref(false)
    const roleEditDialog = ref(false)
    const teamCreateDialog = ref(false)
    const teamEditDialog = ref(false)

    // ---------------------------
    // UI Actions
    // ---------------------------
    function openOrganizationManager(org: any) {
        selectedOrg.value = org
        drawer.value = true
        loadOrganizationDetails()
    }

    async function loadOrganizationDetails() {
        if (!selectedOrg.value) return

        const roleRes = await listRoles(selectedOrg.value.id)
        roleList.value = roleRes.data || []

        const teamRes = await listTeams(selectedOrg.value.id)
        teamList.value = teamRes.data || []
    }

    // ROLE CREATE
    function openRoleCreateDialog() {
        roleNameInput.value = ''
        rolePermissionInput.value = ''
        roleCreateDialog.value = true
    }

    async function uiCreateRole() {
        if (!selectedOrg.value) return

        const permission = JSON.parse(rolePermissionInput.value || '{}')
        await createRole(selectedOrg.value.id, roleNameInput.value, permission)
        roleCreateDialog.value = false
        await loadOrganizationDetails()
    }

    // ROLE EDIT
    function openRoleEditDialog(role: any) {
        selectedRole.value = role
        roleNameInput.value = role.roleName
        rolePermissionInput.value = JSON.stringify(role.permission || {}, null, 2)
        roleEditDialog.value = true
    }

    async function uiUpdateRole() {
        if (!selectedOrg.value || !selectedRole.value) return

        const permission = JSON.parse(rolePermissionInput.value || '{}')
        await updateRole(selectedOrg.value.id, selectedRole.value.id, roleNameInput.value, permission)
        roleEditDialog.value = false
        await loadOrganizationDetails()
    }

    async function uiDeleteRole(roleId: string) {
        if (!selectedOrg.value) return

        await deleteRole(selectedOrg.value.id, roleId)
        await loadOrganizationDetails()
    }

    // TEAM CREATE
    function openTeamCreateDialog() {
        teamNameInput.value = ''
        teamCreateDialog.value = true
    }

    async function uiCreateTeam() {
        if (!selectedOrg.value) return

        await createTeam(selectedOrg.value.id, teamNameInput.value)
        teamCreateDialog.value = false
        await loadOrganizationDetails()
    }

    // TEAM EDIT
    function openTeamEditDialog(team: any) {
        selectedTeam.value = team
        teamNameInput.value = team.name
        teamEditDialog.value = true
    }

    async function uiUpdateTeam() {
        if (!selectedTeam.value || !selectedOrg.value) return

        await updateTeam(selectedTeam.value.id, {
            name: teamNameInput.value,
            organizationId: selectedOrg.value.id,
            updatedAt: new Date(),
        })
        teamEditDialog.value = false
        await loadOrganizationDetails()
    }

    async function uiRemoveTeam(teamId: string) {
        if (!selectedOrg.value) return

        await removeTeam(selectedOrg.value.id, teamId)
        await loadOrganizationDetails()
    }

    // TEAM MEMBERS
    async function openTeamMembers(team: any) {
        selectedTeam.value = team
        const res = await listTeamMembers(team.id)
        memberList.value = res.data || []
    }

    async function uiInviteMember() {
        if (!selectedTeam.value) return

        await inviteMember(inviteEmailInput.value, 'member', selectedTeam.value.id)
        await openTeamMembers(selectedTeam.value)
    }

    async function uiRemoveTeamMember(userId: string) {
        if (!selectedTeam.value) return

        await removeTeamMember(selectedTeam.value.id, userId)
        await openTeamMembers(selectedTeam.value)
    }

    onMounted(loadOrganizations)
</script>