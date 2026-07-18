import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	identitiesInAuth: {
		usersInAuth: r.one.usersInAuth({
			from: r.identitiesInAuth.userId,
			to: r.usersInAuth.id
		}),
	},
	usersInAuth: {
		identitiesInAuths: r.many.identitiesInAuth(),
		mfaFactorsInAuths: r.many.mfaFactorsInAuth(),
		oauthClientsInAuthsViaOauthAuthorizationsInAuth: r.many.oauthClientsInAuth({
			alias: "oauthClientsInAuth_id_usersInAuth_id_via_oauthAuthorizationsInAuth"
		}),
		oauthClientsInAuthsViaOauthConsentsInAuth: r.many.oauthClientsInAuth({
			alias: "oauthClientsInAuth_id_usersInAuth_id_via_oauthConsentsInAuth"
		}),
		oneTimeTokensInAuths: r.many.oneTimeTokensInAuth(),
		oauthClientsInAuthsViaSessionsInAuth: r.many.oauthClientsInAuth({
			alias: "oauthClientsInAuth_id_usersInAuth_id_via_sessionsInAuth"
		}),
		webauthnChallengesInAuths: r.many.webauthnChallengesInAuth(),
		webauthnCredentialsInAuths: r.many.webauthnCredentialsInAuth(),
		emojiReactions: r.many.emojiReactions(),
		profiles: r.many.profiles(),
	},
	mfaAmrClaimsInAuth: {
		sessionsInAuth: r.one.sessionsInAuth({
			from: r.mfaAmrClaimsInAuth.sessionId,
			to: r.sessionsInAuth.id
		}),
	},
	sessionsInAuth: {
		mfaAmrClaimsInAuths: r.many.mfaAmrClaimsInAuth(),
		refreshTokensInAuths: r.many.refreshTokensInAuth(),
	},
	mfaChallengesInAuth: {
		mfaFactorsInAuth: r.one.mfaFactorsInAuth({
			from: r.mfaChallengesInAuth.factorId,
			to: r.mfaFactorsInAuth.id
		}),
	},
	mfaFactorsInAuth: {
		mfaChallengesInAuths: r.many.mfaChallengesInAuth(),
		usersInAuth: r.one.usersInAuth({
			from: r.mfaFactorsInAuth.userId,
			to: r.usersInAuth.id
		}),
	},
	oauthClientsInAuth: {
		usersInAuthsViaOauthAuthorizationsInAuth: r.many.usersInAuth({
			from: r.oauthClientsInAuth.id.through(r.oauthAuthorizationsInAuth.clientId),
			to: r.usersInAuth.id.through(r.oauthAuthorizationsInAuth.userId),
			alias: "oauthClientsInAuth_id_usersInAuth_id_via_oauthAuthorizationsInAuth"
		}),
		usersInAuthsViaOauthConsentsInAuth: r.many.usersInAuth({
			from: r.oauthClientsInAuth.id.through(r.oauthConsentsInAuth.clientId),
			to: r.usersInAuth.id.through(r.oauthConsentsInAuth.userId),
			alias: "oauthClientsInAuth_id_usersInAuth_id_via_oauthConsentsInAuth"
		}),
		usersInAuthsViaSessionsInAuth: r.many.usersInAuth({
			from: r.oauthClientsInAuth.id.through(r.sessionsInAuth.oauthClientId),
			to: r.usersInAuth.id.through(r.sessionsInAuth.userId),
			alias: "oauthClientsInAuth_id_usersInAuth_id_via_sessionsInAuth"
		}),
	},
	oneTimeTokensInAuth: {
		usersInAuth: r.one.usersInAuth({
			from: r.oneTimeTokensInAuth.userId,
			to: r.usersInAuth.id
		}),
	},
	refreshTokensInAuth: {
		sessionsInAuth: r.one.sessionsInAuth({
			from: r.refreshTokensInAuth.sessionId,
			to: r.sessionsInAuth.id
		}),
	},
	samlProvidersInAuth: {
		ssoProvidersInAuth: r.one.ssoProvidersInAuth({
			from: r.samlProvidersInAuth.ssoProviderId,
			to: r.ssoProvidersInAuth.id
		}),
	},
	ssoProvidersInAuth: {
		samlProvidersInAuths: r.many.samlProvidersInAuth(),
		flowStateInAuths: r.many.flowStateInAuth(),
		ssoDomainsInAuths: r.many.ssoDomainsInAuth(),
	},
	flowStateInAuth: {
		ssoProvidersInAuths: r.many.ssoProvidersInAuth({
			from: r.flowStateInAuth.id.through(r.samlRelayStatesInAuth.flowStateId),
			to: r.ssoProvidersInAuth.id.through(r.samlRelayStatesInAuth.ssoProviderId)
		}),
	},
	ssoDomainsInAuth: {
		ssoProvidersInAuth: r.one.ssoProvidersInAuth({
			from: r.ssoDomainsInAuth.ssoProviderId,
			to: r.ssoProvidersInAuth.id
		}),
	},
	webauthnChallengesInAuth: {
		usersInAuth: r.one.usersInAuth({
			from: r.webauthnChallengesInAuth.userId,
			to: r.usersInAuth.id
		}),
	},
	webauthnCredentialsInAuth: {
		usersInAuth: r.one.usersInAuth({
			from: r.webauthnCredentialsInAuth.userId,
			to: r.usersInAuth.id
		}),
	},
	categoriesInEnovels: {
		directusFilesInEnovel: r.one.directusFilesInEnovels({
			from: r.categoriesInEnovels.image,
			to: r.directusFilesInEnovels.id
		}),
		tagsInEnovels: r.many.tagsInEnovels({
			from: r.categoriesInEnovels.id.through(r.categoriesTagsInEnovels.categoriesId),
			to: r.tagsInEnovels.id.through(r.categoriesTagsInEnovels.tagsId)
		}),
	},
	directusFilesInEnovels: {
		categoriesInEnovels: r.many.categoriesInEnovels(),
		charactersInEnovels: r.many.charactersInEnovels(),
		dictionaryInEnovels: r.many.dictionaryInEnovels(),
		directusFoldersInEnovel: r.one.directusFoldersInEnovels({
			from: r.directusFilesInEnovels.folder,
			to: r.directusFoldersInEnovels.id
		}),
		directusUsersInEnovelModifiedBy: r.one.directusUsersInEnovels({
			from: r.directusFilesInEnovels.modifiedBy,
			to: r.directusUsersInEnovels.id,
			alias: "directusFilesInEnovels_modifiedBy_directusUsersInEnovels_id"
		}),
		directusUsersInEnovelUploadedBy: r.one.directusUsersInEnovels({
			from: r.directusFilesInEnovels.uploadedBy,
			to: r.directusUsersInEnovels.id,
			alias: "directusFilesInEnovels_uploadedBy_directusUsersInEnovels_id"
		}),
		itemsInEnovels: r.many.itemsInEnovels(),
		pagesInEnovels: r.many.pagesInEnovels(),
		placesInEnovels: r.many.placesInEnovels(),
		storiesInEnovels: r.many.storiesInEnovels(),
		tagsInEnovels: r.many.tagsInEnovels(),
		typesInEnovels: r.many.typesInEnovels(),
		videosInEnovels: r.many.videosInEnovels(),
	},
	tagsInEnovels: {
		categoriesInEnovels: r.many.categoriesInEnovels(),
		charactersInEnovels: r.many.charactersInEnovels(),
		storiesInEnovels: r.many.storiesInEnovels(),
		directusFilesInEnovel: r.one.directusFilesInEnovels({
			from: r.tagsInEnovels.image,
			to: r.directusFilesInEnovels.id
		}),
		videosInEnovels: r.many.videosInEnovels({
			from: r.tagsInEnovels.id.through(r.tagsVideosInEnovels.tagsId),
			to: r.videosInEnovels.id.through(r.tagsVideosInEnovels.videosId)
		}),
	},
	charactersInEnovels: {
		directusFilesInEnovel: r.one.directusFilesInEnovels({
			from: r.charactersInEnovels.image,
			to: r.directusFilesInEnovels.id
		}),
		abilitiesInEnovels: r.many.abilitiesInEnovels(),
		tagsInEnovels: r.many.tagsInEnovels({
			from: r.charactersInEnovels.id.through(r.charactersTagsInEnovels.charactersId),
			to: r.tagsInEnovels.id.through(r.charactersTagsInEnovels.tagsId)
		}),
		videosInEnovels: r.many.videosInEnovels({
			from: r.charactersInEnovels.id.through(r.charactersVideosInEnovels.charactersId),
			to: r.videosInEnovels.id.through(r.charactersVideosInEnovels.videosId)
		}),
		itemsInEnovels: r.many.itemsInEnovels({
			from: r.charactersInEnovels.id.through(r.itemsCharactersInEnovels.charactersId),
			to: r.itemsInEnovels.id.through(r.itemsCharactersInEnovels.itemsId)
		}),
		levelsInEnovels: r.many.levelsInEnovels({
			from: r.charactersInEnovels.id.through(r.levelsCharactersInEnovels.charactersId),
			to: r.levelsInEnovels.id.through(r.levelsCharactersInEnovels.levelsId)
		}),
		placesInEnovels: r.many.placesInEnovels({
			from: r.charactersInEnovels.id.through(r.placesCharactersInEnovels.charactersId),
			to: r.placesInEnovels.id.through(r.placesCharactersInEnovels.placesId)
		}),
		storiesInEnovels: r.many.storiesInEnovels({
			from: r.charactersInEnovels.id.through(r.storiesCharactersInEnovels.charactersId),
			to: r.storiesInEnovels.id.through(r.storiesCharactersInEnovels.storiesId)
		}),
		typesInEnovels: r.many.typesInEnovels({
			from: r.charactersInEnovels.id.through(r.typesCharactersInEnovels.charactersId),
			to: r.typesInEnovels.id.through(r.typesCharactersInEnovels.typesId)
		}),
	},
	abilitiesInEnovels: {
		charactersInEnovels: r.many.charactersInEnovels({
			from: r.abilitiesInEnovels.id.through(r.charactersAbilitiesInEnovels.abilitiesId),
			to: r.charactersInEnovels.id.through(r.charactersAbilitiesInEnovels.charactersId)
		}),
		itemsInEnovels: r.many.itemsInEnovels({
			from: r.abilitiesInEnovels.id.through(r.itemsAbilitiesInEnovels.abilitiesId),
			to: r.itemsInEnovels.id.through(r.itemsAbilitiesInEnovels.itemsId)
		}),
	},
	videosInEnovels: {
		charactersInEnovels: r.many.charactersInEnovels(),
		itemsInEnovels: r.many.itemsInEnovels(),
		tagsInEnovels: r.many.tagsInEnovels(),
		directusFilesInEnovel: r.one.directusFilesInEnovels({
			from: r.videosInEnovels.file,
			to: r.directusFilesInEnovels.id
		}),
	},
	dictionaryInEnovels: {
		directusFilesInEnovel: r.one.directusFilesInEnovels({
			from: r.dictionaryInEnovels.image,
			to: r.directusFilesInEnovels.id
		}),
	},
	directusAccessInEnovels: {
		directusPoliciesInEnovel: r.one.directusPoliciesInEnovels({
			from: r.directusAccessInEnovels.policy,
			to: r.directusPoliciesInEnovels.id
		}),
		directusRolesInEnovel: r.one.directusRolesInEnovels({
			from: r.directusAccessInEnovels.role,
			to: r.directusRolesInEnovels.id
		}),
		directusUsersInEnovel: r.one.directusUsersInEnovels({
			from: r.directusAccessInEnovels.user,
			to: r.directusUsersInEnovels.id
		}),
	},
	directusPoliciesInEnovels: {
		directusAccessInEnovels: r.many.directusAccessInEnovels(),
		directusPermissionsInEnovels: r.many.directusPermissionsInEnovels(),
	},
	directusRolesInEnovels: {
		directusAccessInEnovels: r.many.directusAccessInEnovels(),
		directusUsersInEnovelsViaDirectusPresetsInEnovels: r.many.directusUsersInEnovels({
			from: r.directusRolesInEnovels.id.through(r.directusPresetsInEnovels.role),
			to: r.directusUsersInEnovels.id.through(r.directusPresetsInEnovels.user),
			alias: "directusRolesInEnovels_id_directusUsersInEnovels_id_via_directusPresetsInEnovels"
		}),
		directusRolesInEnovel: r.one.directusRolesInEnovels({
			from: r.directusRolesInEnovels.parent,
			to: r.directusRolesInEnovels.id,
			alias: "directusRolesInEnovels_parent_directusRolesInEnovels_id"
		}),
		directusRolesInEnovels: r.many.directusRolesInEnovels({
			alias: "directusRolesInEnovels_parent_directusRolesInEnovels_id"
		}),
		directusSharesInEnovels: r.many.directusSharesInEnovels(),
		directusUsersInEnovelsRole: r.many.directusUsersInEnovels({
			alias: "directusUsersInEnovels_role_directusRolesInEnovels_id"
		}),
	},
	directusUsersInEnovels: {
		directusAccessInEnovels: r.many.directusAccessInEnovels(),
		directusDashboardsInEnovelsUserCreated: r.many.directusDashboardsInEnovels({
			alias: "directusDashboardsInEnovels_userCreated_directusUsersInEnovels_id"
		}),
		directusFilesInEnovelsModifiedBy: r.many.directusFilesInEnovels({
			alias: "directusFilesInEnovels_modifiedBy_directusUsersInEnovels_id"
		}),
		directusFilesInEnovelsUploadedBy: r.many.directusFilesInEnovels({
			alias: "directusFilesInEnovels_uploadedBy_directusUsersInEnovels_id"
		}),
		directusFlowsInEnovels: r.many.directusFlowsInEnovels(),
		directusOperationsInEnovels: r.many.directusOperationsInEnovels(),
		directusDashboardsInEnovelsViaDirectusPanelsInEnovels: r.many.directusDashboardsInEnovels({
			alias: "directusDashboardsInEnovels_id_directusUsersInEnovels_id_via_directusPanelsInEnovels"
		}),
		directusRolesInEnovels: r.many.directusRolesInEnovels({
			alias: "directusRolesInEnovels_id_directusUsersInEnovels_id_via_directusPresetsInEnovels"
		}),
		directusSharesInEnovelsViaDirectusSessionsInEnovels: r.many.directusSharesInEnovels({
			alias: "directusSharesInEnovels_id_directusUsersInEnovels_id_via_directusSessionsInEnovels"
		}),
		directusSharesInEnovelsUserCreated: r.many.directusSharesInEnovels({
			alias: "directusSharesInEnovels_userCreated_directusUsersInEnovels_id"
		}),
		directusRolesInEnovel: r.one.directusRolesInEnovels({
			from: r.directusUsersInEnovels.role,
			to: r.directusRolesInEnovels.id,
			alias: "directusUsersInEnovels_role_directusRolesInEnovels_id"
		}),
		directusVersionsInEnovelsUserCreated: r.many.directusVersionsInEnovels({
			alias: "directusVersionsInEnovels_userCreated_directusUsersInEnovels_id"
		}),
		directusVersionsInEnovelsUserUpdated: r.many.directusVersionsInEnovels({
			alias: "directusVersionsInEnovels_userUpdated_directusUsersInEnovels_id"
		}),
		storiesInEnovelsUserCreated: r.many.storiesInEnovels({
			alias: "storiesInEnovels_userCreated_directusUsersInEnovels_id"
		}),
		storiesInEnovelsUserUpdated: r.many.storiesInEnovels({
			alias: "storiesInEnovels_userUpdated_directusUsersInEnovels_id"
		}),
	},
	directusCollectionsInEnovels: {
		directusCollectionsInEnovel: r.one.directusCollectionsInEnovels({
			from: r.directusCollectionsInEnovels.group,
			to: r.directusCollectionsInEnovels.collection,
			alias: "directusCollectionsInEnovels_group_directusCollectionsInEnovels_collection"
		}),
		directusCollectionsInEnovels: r.many.directusCollectionsInEnovels({
			alias: "directusCollectionsInEnovels_group_directusCollectionsInEnovels_collection"
		}),
		directusSharesInEnovels: r.many.directusSharesInEnovels(),
		directusVersionsInEnovels: r.many.directusVersionsInEnovels(),
	},
	directusDashboardsInEnovels: {
		directusUsersInEnovel: r.one.directusUsersInEnovels({
			from: r.directusDashboardsInEnovels.userCreated,
			to: r.directusUsersInEnovels.id,
			alias: "directusDashboardsInEnovels_userCreated_directusUsersInEnovels_id"
		}),
		directusUsersInEnovels: r.many.directusUsersInEnovels({
			from: r.directusDashboardsInEnovels.id.through(r.directusPanelsInEnovels.dashboard),
			to: r.directusUsersInEnovels.id.through(r.directusPanelsInEnovels.userCreated),
			alias: "directusDashboardsInEnovels_id_directusUsersInEnovels_id_via_directusPanelsInEnovels"
		}),
	},
	directusFoldersInEnovels: {
		directusFilesInEnovels: r.many.directusFilesInEnovels(),
		directusFoldersInEnovel: r.one.directusFoldersInEnovels({
			from: r.directusFoldersInEnovels.parent,
			to: r.directusFoldersInEnovels.id,
			alias: "directusFoldersInEnovels_parent_directusFoldersInEnovels_id"
		}),
		directusFoldersInEnovels: r.many.directusFoldersInEnovels({
			alias: "directusFoldersInEnovels_parent_directusFoldersInEnovels_id"
		}),
	},
	directusFlowsInEnovels: {
		directusUsersInEnovel: r.one.directusUsersInEnovels({
			from: r.directusFlowsInEnovels.userCreated,
			to: r.directusUsersInEnovels.id
		}),
		directusOperationsInEnovels: r.many.directusOperationsInEnovels(),
		directusWebhooksInEnovels: r.many.directusWebhooksInEnovels(),
	},
	directusOperationsInEnovels: {
		directusFlowsInEnovel: r.one.directusFlowsInEnovels({
			from: r.directusOperationsInEnovels.flow,
			to: r.directusFlowsInEnovels.id
		}),
		directusOperationsInEnovelReject: r.one.directusOperationsInEnovels({
			from: r.directusOperationsInEnovels.reject,
			to: r.directusOperationsInEnovels.id,
			alias: "directusOperationsInEnovels_reject_directusOperationsInEnovels_id"
		}),
		directusOperationsInEnovelsReject: r.one.directusOperationsInEnovels({
			alias: "directusOperationsInEnovels_reject_directusOperationsInEnovels_id"
		}),
		directusOperationsInEnovelResolve: r.one.directusOperationsInEnovels({
			from: r.directusOperationsInEnovels.resolve,
			to: r.directusOperationsInEnovels.id,
			alias: "directusOperationsInEnovels_resolve_directusOperationsInEnovels_id"
		}),
		directusOperationsInEnovelsResolve: r.one.directusOperationsInEnovels({
			alias: "directusOperationsInEnovels_resolve_directusOperationsInEnovels_id"
		}),
		directusUsersInEnovel: r.one.directusUsersInEnovels({
			from: r.directusOperationsInEnovels.userCreated,
			to: r.directusUsersInEnovels.id
		}),
	},
	directusPermissionsInEnovels: {
		directusPoliciesInEnovel: r.one.directusPoliciesInEnovels({
			from: r.directusPermissionsInEnovels.policy,
			to: r.directusPoliciesInEnovels.id
		}),
	},
	directusRevisionsInEnovels: {
		directusActivityInEnovel: r.one.directusActivityInEnovels({
			from: r.directusRevisionsInEnovels.activity,
			to: r.directusActivityInEnovels.id
		}),
		directusRevisionsInEnovel: r.one.directusRevisionsInEnovels({
			from: r.directusRevisionsInEnovels.parent,
			to: r.directusRevisionsInEnovels.id,
			alias: "directusRevisionsInEnovels_parent_directusRevisionsInEnovels_id"
		}),
		directusRevisionsInEnovels: r.many.directusRevisionsInEnovels({
			alias: "directusRevisionsInEnovels_parent_directusRevisionsInEnovels_id"
		}),
		directusVersionsInEnovel: r.one.directusVersionsInEnovels({
			from: r.directusRevisionsInEnovels.version,
			to: r.directusVersionsInEnovels.id
		}),
	},
	directusActivityInEnovels: {
		directusRevisionsInEnovels: r.many.directusRevisionsInEnovels(),
	},
	directusVersionsInEnovels: {
		directusRevisionsInEnovels: r.many.directusRevisionsInEnovels(),
		directusCollectionsInEnovel: r.one.directusCollectionsInEnovels({
			from: r.directusVersionsInEnovels.collection,
			to: r.directusCollectionsInEnovels.collection
		}),
		directusUsersInEnovelUserCreated: r.one.directusUsersInEnovels({
			from: r.directusVersionsInEnovels.userCreated,
			to: r.directusUsersInEnovels.id,
			alias: "directusVersionsInEnovels_userCreated_directusUsersInEnovels_id"
		}),
		directusUsersInEnovelUserUpdated: r.one.directusUsersInEnovels({
			from: r.directusVersionsInEnovels.userUpdated,
			to: r.directusUsersInEnovels.id,
			alias: "directusVersionsInEnovels_userUpdated_directusUsersInEnovels_id"
		}),
	},
	directusSharesInEnovels: {
		directusUsersInEnovels: r.many.directusUsersInEnovels({
			from: r.directusSharesInEnovels.id.through(r.directusSessionsInEnovels.share),
			to: r.directusUsersInEnovels.id.through(r.directusSessionsInEnovels.user),
			alias: "directusSharesInEnovels_id_directusUsersInEnovels_id_via_directusSessionsInEnovels"
		}),
		directusCollectionsInEnovel: r.one.directusCollectionsInEnovels({
			from: r.directusSharesInEnovels.collection,
			to: r.directusCollectionsInEnovels.collection
		}),
		directusRolesInEnovel: r.one.directusRolesInEnovels({
			from: r.directusSharesInEnovels.role,
			to: r.directusRolesInEnovels.id
		}),
		directusUsersInEnovel: r.one.directusUsersInEnovels({
			from: r.directusSharesInEnovels.userCreated,
			to: r.directusUsersInEnovels.id,
			alias: "directusSharesInEnovels_userCreated_directusUsersInEnovels_id"
		}),
	},
	directusWebhooksInEnovels: {
		directusFlowsInEnovel: r.one.directusFlowsInEnovels({
			from: r.directusWebhooksInEnovels.migratedFlow,
			to: r.directusFlowsInEnovels.id
		}),
	},
	itemsInEnovels: {
		directusFilesInEnovel: r.one.directusFilesInEnovels({
			from: r.itemsInEnovels.image,
			to: r.directusFilesInEnovels.id
		}),
		abilitiesInEnovels: r.many.abilitiesInEnovels(),
		charactersInEnovels: r.many.charactersInEnovels(),
		videosInEnovels: r.many.videosInEnovels({
			from: r.itemsInEnovels.id.through(r.itemsVideosInEnovels.itemsId),
			to: r.videosInEnovels.id.through(r.itemsVideosInEnovels.videosId)
		}),
		placesInEnovels: r.many.placesInEnovels({
			from: r.itemsInEnovels.id.through(r.placesItemsInEnovels.itemsId),
			to: r.placesInEnovels.id.through(r.placesItemsInEnovels.placesId)
		}),
	},
	levelsInEnovels: {
		charactersInEnovels: r.many.charactersInEnovels(),
	},
	pagesInEnovels: {
		directusFilesInEnovel: r.one.directusFilesInEnovels({
			from: r.pagesInEnovels.image,
			to: r.directusFilesInEnovels.id
		}),
	},
	placesInEnovels: {
		directusFilesInEnovel: r.one.directusFilesInEnovels({
			from: r.placesInEnovels.image,
			to: r.directusFilesInEnovels.id
		}),
		charactersInEnovels: r.many.charactersInEnovels(),
		itemsInEnovels: r.many.itemsInEnovels(),
	},
	storiesInEnovels: {
		directusFilesInEnovel: r.one.directusFilesInEnovels({
			from: r.storiesInEnovels.image,
			to: r.directusFilesInEnovels.id
		}),
		directusUsersInEnovelUserCreated: r.one.directusUsersInEnovels({
			from: r.storiesInEnovels.userCreated,
			to: r.directusUsersInEnovels.id,
			alias: "storiesInEnovels_userCreated_directusUsersInEnovels_id"
		}),
		directusUsersInEnovelUserUpdated: r.one.directusUsersInEnovels({
			from: r.storiesInEnovels.userUpdated,
			to: r.directusUsersInEnovels.id,
			alias: "storiesInEnovels_userUpdated_directusUsersInEnovels_id"
		}),
		charactersInEnovels: r.many.charactersInEnovels(),
		tagsInEnovels: r.many.tagsInEnovels({
			from: r.storiesInEnovels.id.through(r.storiesTagsInEnovels.storiesId),
			to: r.tagsInEnovels.id.through(r.storiesTagsInEnovels.tagsId)
		}),
	},
	typesInEnovels: {
		directusFilesInEnovel: r.one.directusFilesInEnovels({
			from: r.typesInEnovels.image,
			to: r.directusFilesInEnovels.id
		}),
		charactersInEnovels: r.many.charactersInEnovels(),
	},
	hdbCronEventInvocationLogsInHdbCatalog: {
		hdbCronEventsInHdbCatalog: r.one.hdbCronEventsInHdbCatalog({
			from: r.hdbCronEventInvocationLogsInHdbCatalog.eventId,
			to: r.hdbCronEventsInHdbCatalog.id
		}),
	},
	hdbCronEventsInHdbCatalog: {
		hdbCronEventInvocationLogsInHdbCatalogs: r.many.hdbCronEventInvocationLogsInHdbCatalog(),
	},
	hdbScheduledEventInvocationLogsInHdbCatalog: {
		hdbScheduledEventsInHdbCatalog: r.one.hdbScheduledEventsInHdbCatalog({
			from: r.hdbScheduledEventInvocationLogsInHdbCatalog.eventId,
			to: r.hdbScheduledEventsInHdbCatalog.id
		}),
	},
	hdbScheduledEventsInHdbCatalog: {
		hdbScheduledEventInvocationLogsInHdbCatalogs: r.many.hdbScheduledEventInvocationLogsInHdbCatalog(),
	},
	keyInPgsodium: {
		keyInPgsodium: r.one.keyInPgsodium({
			from: r.keyInPgsodium.parentKey,
			to: r.keyInPgsodium.id,
			alias: "keyInPgsodium_parentKey_keyInPgsodium_id"
		}),
		keyInPgsodiums: r.many.keyInPgsodium({
			alias: "keyInPgsodium_parentKey_keyInPgsodium_id"
		}),
	},
	aboutDepartmentsArticles: {
		article: r.one.articles({
			from: r.aboutDepartmentsArticles.articlesId,
			to: r.articles.id
		}),
	},
	articles: {
		aboutDepartmentsArticles: r.many.aboutDepartmentsArticles(),
		directusUser: r.one.directusUsers({
			from: r.articles.author,
			to: r.directusUsers.id
		}),
		categories: r.many.categories({
			from: r.articles.id.through(r.articlesCategories.articlesId),
			to: r.categories.id.through(r.articlesCategories.categoriesId)
		}),
		comments: r.many.comments({
			from: r.articles.id.through(r.articlesComments.articlesId),
			to: r.comments.id.through(r.articlesComments.commentsId)
		}),
		departments: r.many.departments({
			from: r.articles.id.through(r.articlesDepartments.articlesId),
			to: r.departments.id.through(r.articlesDepartments.departmentsId)
		}),
		financeIndices: r.many.financeIndex({
			from: r.articles.id.through(r.financeIndexArticles.articlesId),
			to: r.financeIndex.id.through(r.financeIndexArticles.financeIndexId)
		}),
		platforms: r.many.platform({
			from: r.articles.id.through(r.platformArticles.articlesId),
			to: r.platform.id.through(r.platformArticles.platformId)
		}),
		spaces: r.many.spaces({
			from: r.articles.id.through(r.spacesArticles.articlesId),
			to: r.spaces.id.through(r.spacesArticles.spacesId)
		}),
		tags: r.many.tags({
			from: r.articles.id.through(r.tagsArticles.articlesId),
			to: r.tags.id.through(r.tagsArticles.tagsId)
		}),
	},
	aboutDepartmentsPages: {
		page: r.one.pages({
			from: r.aboutDepartmentsPages.pagesId,
			to: r.pages.id
		}),
	},
	pages: {
		aboutDepartmentsPages: r.many.aboutDepartmentsPages(),
		navigations: r.many.navigation(),
		seoRelation: r.one.seo({
			from: r.pages.seo,
			to: r.seo.id
		}),
		platforms: r.many.platform({
			from: r.pages.id.through(r.platformPages.pagesId),
			to: r.platform.id.through(r.platformPages.platformId)
		}),
		spaces: r.many.spaces({
			from: r.pages.id.through(r.spacesPages.pagesId),
			to: r.spaces.id.through(r.spacesPages.spacesId)
		}),
	},
	aboutDepartmentsPlatform: {
		platform: r.one.platform({
			from: r.aboutDepartmentsPlatform.platformId,
			to: r.platform.id
		}),
	},
	platform: {
		aboutDepartmentsPlatforms: r.many.aboutDepartmentsPlatform(),
		integrations: r.many.integrations(),
		directusFile: r.one.directusFiles({
			from: r.platform.image,
			to: r.directusFiles.id
		}),
		articles: r.many.articles(),
		categories: r.many.categories(),
		lists: r.many.lists(),
		navigations: r.many.navigation(),
		pageBlocks: r.many.pageBlocks(),
		pages: r.many.pages(),
		products: r.many.products({
			from: r.platform.id.through(r.platformProducts.platformId),
			to: r.products.id.through(r.platformProducts.productsId)
		}),
	},
	address: {
		carts: r.many.cart({
			from: r.address.id.through(r.addressCart.addressId),
			to: r.cart.id.through(r.addressCart.cartId)
		}),
		cities: r.many.cities({
			from: r.address.id.through(r.addressCities.addressId),
			to: r.cities.id.through(r.addressCities.citiesId)
		}),
		countries: r.many.countries({
			from: r.address.id.through(r.addressCountries.addressId),
			to: r.countries.id.through(r.addressCountries.countriesId)
		}),
		addressDirectusUsers: r.many.addressDirectusUsers(),
		friendRequests: r.many.friendRequests({
			from: r.address.id.through(r.friendRequestsAddress.addressId),
			to: r.friendRequests.id.through(r.friendRequestsAddress.friendRequestsId)
		}),
		invoices: r.many.invoices({
			from: r.address.id.through(r.invoicesAddress.addressId),
			to: r.invoices.id.through(r.invoicesAddress.invoiceId)
		}),
		regions: r.many.region({
			from: r.address.id.through(r.regionAddress.addressId),
			to: r.region.id.through(r.regionAddress.regionId)
		}),
		shipments: r.many.shipment({
			from: r.address.id.through(r.shipmentAddress.addressId),
			to: r.shipment.id.through(r.shipmentAddress.shipmentId)
		}),
	},
	cart: {
		addresses: r.many.address(),
		directusUser: r.one.directusUsers({
			from: r.cart.user,
			to: r.directusUsers.id
		}),
		cartItems: r.many.cartItems({
			from: r.cart.id.through(r.cartCartItems.cartId),
			to: r.cartItems.id.through(r.cartCartItems.cartItemsId)
		}),
		productsRelation: r.many.products({
			from: r.cart.id.through(r.cartItems.cart),
			to: r.products.id.through(r.cartItems.products),
			alias: "cart_id_products_id_via_cartItems"
		}),
		products: r.many.products({
			from: r.cart.id.through(r.cartProducts.cartId),
			to: r.products.id.through(r.cartProducts.productsId),
			alias: "cart_id_products_id_via_cartProducts"
		}),
	},
	cities: {
		addresses: r.many.address(),
		citiesCountries: r.many.citiesCountries(),
		citiesStates: r.many.citiesStates(),
		events: r.many.events({
			from: r.cities.id.through(r.eventsCities.citiesId),
			to: r.events.id.through(r.eventsCities.eventsId)
		}),
		geoRegions: r.many.geoRegions({
			from: r.cities.id.through(r.geoRegionsCities.citiesId),
			to: r.geoRegions.id.through(r.geoRegionsCities.geoRegionsId)
		}),
		profiles: r.many.profiles({
			from: r.cities.id.through(r.profilesCities.citiesId),
			to: r.profiles.id.through(r.profilesCities.profilesId)
		}),
		shippingAddresses: r.many.shippingAddresses({
			from: r.cities.id.through(r.shippingAddressesCities.citiesId),
			to: r.shippingAddresses.id.through(r.shippingAddressesCities.shippingAddressesId)
		}),
		spaces: r.many.spaces({
			from: r.cities.id.through(r.spacesCities.citiesId),
			to: r.spaces.id.through(r.spacesCities.spacesId)
		}),
		states: r.many.states({
			from: r.cities.id.through(r.statesCities.citiesId),
			to: r.states.id.through(r.statesCities.statesId)
		}),
	},
	countries: {
		addresses: r.many.address(),
		currencies: r.many.currency({
			from: r.countries.id.through(r.countriesCurrency.countriesId),
			to: r.currency.id.through(r.countriesCurrency.currencyId)
		}),
		timezones: r.many.timezones({
			from: r.countries.id.through(r.countriesTimezones.countriesId),
			to: r.timezones.id.through(r.countriesTimezones.timezonesId)
		}),
		events: r.many.events({
			from: r.countries.id.through(r.eventsCountries.countriesId),
			to: r.events.id.through(r.eventsCountries.eventsId)
		}),
		geoRegions: r.many.geoRegions({
			from: r.countries.id.through(r.geoRegionsCountries.countriesId),
			to: r.geoRegions.id.through(r.geoRegionsCountries.geoRegionsId)
		}),
		manufacturers: r.many.manufacturer({
			from: r.countries.id.through(r.manufacturerCountries.countriesId),
			to: r.manufacturer.id.through(r.manufacturerCountries.manufacturerId)
		}),
		payments: r.many.payments({
			from: r.countries.id.through(r.paymentsCountries.countryId),
			to: r.payments.id.through(r.paymentsCountries.paymentId)
		}),
		profiles: r.many.profiles({
			from: r.countries.id.through(r.profilesCountries.countriesId),
			to: r.profiles.id.through(r.profilesCountries.profilesId)
		}),
		regions: r.many.region({
			from: r.countries.id.through(r.regionCountries.countriesId),
			to: r.region.id.through(r.regionCountries.regionId)
		}),
		shippingAddresses: r.many.shippingAddresses({
			from: r.countries.id.through(r.shippingAddressesCountries.countriesId),
			to: r.shippingAddresses.id.through(r.shippingAddressesCountries.shippingAddressesId)
		}),
		shops: r.many.shops({
			from: r.countries.id.through(r.shopsCountries.countriesId),
			to: r.shops.id.through(r.shopsCountries.shopsId)
		}),
		sitePreferenceCountries: r.many.sitePreferenceCountries(),
		spaces: r.many.spaces({
			from: r.countries.id.through(r.spacesCountries.countriesId),
			to: r.spaces.id.through(r.spacesCountries.spacesId)
		}),
		taxes: r.many.taxes({
			from: r.countries.id.through(r.taxesCountries.countriesId),
			to: r.taxes.id.through(r.taxesCountries.taxesId)
		}),
	},
	addressDirectusUsers: {
		address: r.one.address({
			from: r.addressDirectusUsers.addressId,
			to: r.address.id
		}),
	},
	agreementsProducts: {
		product: r.one.products({
			from: r.agreementsProducts.productsId,
			to: r.products.id
		}),
	},
	products: {
		agreementsProducts: r.many.agreementsProducts(),
		attributesViaAttributesProducts: r.many.attributes({
			alias: "attributes_id_products_id_via_attributesProducts"
		}),
		auctionLots: r.many.auctionLots(),
		brands: r.many.brands(),
		cartsViaCartItems: r.many.cart({
			alias: "cart_id_products_id_via_cartItems"
		}),
		cartsViaCartProducts: r.many.cart({
			alias: "cart_id_products_id_via_cartProducts"
		}),
		chartsViaChartEntries: r.many.charts({
			alias: "charts_id_products_id_via_chartEntries"
		}),
		chartsViaChartsProducts: r.many.charts({
			alias: "charts_id_products_id_via_chartsProducts"
		}),
		circlesProducts: r.many.circlesProducts(),
		collections: r.many.collections(),
		comments: r.many.comments(),
		couponsProducts: r.many.couponsProducts(),
		crossSellProducts: r.many.crossSellProducts(),
		departmentsViaDepartmentsProducts: r.many.departments({
			alias: "departments_id_products_id_via_departmentsProducts"
		}),
		events: r.many.events(),
		faqs: r.many.faqs(),
		gamifications: r.many.gamification(),
		incentives: r.many.incentives(),
		listItems: r.many.listItems(),
		lists: r.many.lists(),
		memberGroupsProducts: r.many.memberGroupsProducts(),
		moments: r.many.moments(),
		orderItems: r.many.orderItems(),
		orders: r.many.orders(),
		platforms: r.many.platform(),
		postgresstores: r.many.postgresstores(),
		attributesViaProductAttributes: r.many.attributes({
			alias: "attributes_id_products_id_via_productAttributes"
		}),
		productTypes: r.many.productTypes(),
		attributesViaProductsAttributes: r.many.attributes({
			alias: "attributes_id_products_id_via_productsAttributes"
		}),
		categories: r.many.categories(),
		productsCountries: r.many.productsCountries(),
		currencies: r.many.currency(),
		departmentsViaProductsDepartments: r.many.departments({
			alias: "departments_id_products_id_via_productsDepartments"
		}),
		productsDirectusUsers: r.many.productsDirectusUsers(),
		manufacturers: r.many.manufacturer(),
		productsProductDesigners: r.many.productsProductDesigner(),
		spaces: r.many.spaces({
			from: r.products.id.through(r.productsSpaces.productsId),
			to: r.spaces.id.through(r.productsSpaces.spacesId)
		}),
		tagsViaProductsTags: r.many.tags({
			from: r.products.id.through(r.productsTags.productsId),
			to: r.tags.id.through(r.productsTags.tagsId),
			alias: "products_id_tags_id_via_productsTags"
		}),
		websites: r.many.websites({
			from: r.products.id.through(r.productsWebsites.productsId),
			to: r.websites.id.through(r.productsWebsites.websitesId)
		}),
		projects: r.many.projects({
			from: r.products.id.through(r.projectsProducts.productsId),
			to: r.projects.id.through(r.projectsProducts.projectsId)
		}),
		ratings: r.many.ratings({
			from: r.products.id.through(r.ratingsProducts.productsId),
			to: r.ratings.id.through(r.ratingsProducts.ratingsId)
		}),
		reactions: r.many.reactions(),
		relatedProducts: r.many.relatedProducts({
			from: r.products.id.through(r.relatedProductsProducts.productsId),
			to: r.relatedProducts.id.through(r.relatedProductsProducts.relatedProductsId)
		}),
		reports: r.many.report({
			from: r.products.id.through(r.reportProducts.productsId),
			to: r.report.id.through(r.reportProducts.reportId)
		}),
		returns: r.many.returns({
			from: r.products.id.through(r.returnsProducts.productsId),
			to: r.returns.id.through(r.returnsProducts.returnsId)
		}),
		reviewsProducts: r.many.reviewsProducts(),
		shipments: r.many.shipment({
			from: r.products.id.through(r.shipmentProducts.productsId),
			to: r.shipment.id.through(r.shipmentProducts.shipmentId)
		}),
		shops: r.many.shops({
			from: r.products.id.through(r.shopsProducts.productsId),
			to: r.shops.id.through(r.shopsProducts.shopsId)
		}),
		shorts: r.many.shorts({
			from: r.products.id.through(r.shortsProducts.productsId),
			to: r.shorts.id.through(r.shortsProducts.shortsId)
		}),
		showcases: r.many.showcases({
			from: r.products.id.through(r.showcasesProducts.productsId),
			to: r.showcases.id.through(r.showcasesProducts.showcasesId)
		}),
		sitePreferenceProducts: r.many.sitePreferenceProducts(),
		spaceProducts: r.many.spaceProducts(),
		subscriptions: r.many.subscriptions({
			from: r.products.id.through(r.subscriptionsProducts.productsId),
			to: r.subscriptions.id.through(r.subscriptionsProducts.subscriptionsId)
		}),
		tagsViaTagsProducts: r.many.tags({
			from: r.products.id.through(r.tagsProducts.productsId),
			to: r.tags.id.through(r.tagsProducts.tagsId),
			alias: "products_id_tags_id_via_tagsProducts"
		}),
		variants: r.many.variants(),
		vibezClips: r.many.vibezClips(),
		videos: r.many.videos({
			from: r.products.id.through(r.videosProducts.productsId),
			to: r.videos.id.through(r.videosProducts.videosId)
		}),
	},
	announcements: {
		directusFile: r.one.directusFiles({
			from: r.announcements.image,
			to: r.directusFiles.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.announcements.userCreated,
			to: r.directusUsers.id,
			alias: "announcements_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.announcements.userUpdated,
			to: r.directusUsers.id,
			alias: "announcements_userUpdated_directusUsers_id"
		}),
	},
	directusFiles: {
		announcements: r.many.announcements(),
		blockColumnsRows: r.many.blockColumnsRows(),
		blockGalleryFiles: r.many.blockGalleryFiles(),
		blockButtonGroups: r.many.blockButtonGroup(),
		blockLogoclouds: r.many.blockLogocloud(),
		blockStepItems: r.many.blockStepItems(),
		blockVideos: r.many.blockVideo(),
		brands: r.many.brands(),
		calendars: r.many.calendar(),
		charts: r.many.charts(),
		chats: r.many.chat(),
		directusFolder: r.one.directusFolders({
			from: r.directusFiles.folder,
			to: r.directusFolders.id
		}),
		directusUserModifiedBy: r.one.directusUsers({
			from: r.directusFiles.modifiedBy,
			to: r.directusUsers.id,
			alias: "directusFiles_modifiedBy_directusUsers_id"
		}),
		directusUserUploadedBy: r.one.directusUsers({
			from: r.directusFiles.uploadedBy,
			to: r.directusUsers.id,
			alias: "directusFiles_uploadedBy_directusUsers_id"
		}),
		directusSettingsProjectLogo: r.many.directusSettings({
			alias: "directusSettings_projectLogo_directusFiles_id"
		}),
		directusSettingsPublicBackground: r.many.directusSettings({
			alias: "directusSettings_publicBackground_directusFiles_id"
		}),
		directusSettingsPublicFavicon: r.many.directusSettings({
			alias: "directusSettings_publicFavicon_directusFiles_id"
		}),
		directusSettingsPublicForeground: r.many.directusSettings({
			alias: "directusSettings_publicForeground_directusFiles_id"
		}),
		eventsImage: r.many.events({
			alias: "events_image_directusFiles_id"
		}),
		eventsViaEventsFiles: r.many.events({
			from: r.directusFiles.id.through(r.eventsFiles.directusFilesId),
			to: r.events.id.through(r.eventsFiles.eventsId),
			alias: "directusFiles_id_events_id_via_eventsFiles"
		}),
		globalsLogoOnDarkBg: r.many.globals({
			alias: "globals_logoOnDarkBg_directusFiles_id"
		}),
		globalsLogoOnLightBg: r.many.globals({
			alias: "globals_logoOnLightBg_directusFiles_id"
		}),
		globalsOgImage: r.many.globals({
			alias: "globals_ogImage_directusFiles_id"
		}),
		integrations: r.many.integrations({
			from: r.directusFiles.id.through(r.integrationsFiles.directusFilesId),
			to: r.integrations.id.through(r.integrationsFiles.integrationsId)
		}),
		listItems: r.many.listItems(),
		lists: r.many.lists({
			from: r.directusFiles.id.through(r.listsFiles.directusFilesId),
			to: r.lists.id.through(r.listsFiles.listsId)
		}),
		media: r.many.media({
			from: r.directusFiles.id.through(r.mediaFiles.directusFilesId),
			to: r.media.id.through(r.mediaFiles.mediaId)
		}),
		organizations: r.many.organizations(),
		osExpenses: r.many.osExpenses(),
		osProposalApprovals: r.many.osProposalApprovals(),
		osTasks: r.many.osTasks({
			from: r.directusFiles.id.through(r.osTaskFiles.directusFilesId),
			to: r.osTasks.id.through(r.osTaskFiles.osTasksId)
		}),
		outlets: r.many.outlets(),
		pageBlocks: r.many.pageBlocks({
			from: r.directusFiles.id.through(r.pageBlocksFiles.directusFilesId),
			to: r.pageBlocks.id.through(r.pageBlocksFiles.pageBlocksId)
		}),
		platforms: r.many.platform(),
		polls: r.many.polls(),
		postGalleryItems: r.many.postGalleryItems(),
		postsAudio: r.many.posts({
			alias: "posts_audio_directusFiles_id"
		}),
		postsImage: r.many.posts({
			alias: "posts_image_directusFiles_id"
		}),
		profiles: r.many.profiles(),
		projectBoards: r.many.projectBoard({
			from: r.directusFiles.id.through(r.projectBoardFiles.directusFilesId),
			to: r.projectBoard.id.through(r.projectBoardFiles.projectBoardId)
		}),
		projectsIcon: r.many.projects({
			alias: "projects_icon_directusFiles_id"
		}),
		projectsViaProjectsFiles: r.many.projects({
			from: r.directusFiles.id.through(r.projectsFiles.directusFilesId),
			to: r.projects.id.through(r.projectsFiles.projectsId),
			alias: "directusFiles_id_projects_id_via_projectsFiles"
		}),
		radiosFile: r.many.radios({
			alias: "radios_file_directusFiles_id"
		}),
		radiosImage: r.many.radios({
			alias: "radios_image_directusFiles_id"
		}),
		ratings: r.many.ratings(),
		reactions: r.many.reactions(),
		shortsVideo: r.many.shorts({
			alias: "shorts_video_directusFiles_id"
		}),
		shortsViaShortsFiles: r.many.shorts({
			from: r.directusFiles.id.through(r.shortsFiles.directusFilesId),
			to: r.shorts.id.through(r.shortsFiles.shortsId),
			alias: "directusFiles_id_shorts_id_via_shortsFiles"
		}),
		spaceTypes: r.many.spaceTypes(),
		spacesCoverImage: r.many.spaces({
			alias: "spaces_coverImage_directusFiles_id"
		}),
		spacesImage: r.many.spaces({
			alias: "spaces_image_directusFiles_id"
		}),
		spacesViaSpacesFiles: r.many.spaces({
			from: r.directusFiles.id.through(r.spacesFiles.directusFilesId),
			to: r.spaces.id.through(r.spacesFiles.spacesId),
			alias: "directusFiles_id_spaces_id_via_spacesFiles"
		}),
		teams: r.many.team(),
		testimonialsCompanyLogo: r.many.testimonials({
			alias: "testimonials_companyLogo_directusFiles_id"
		}),
		testimonialsImage: r.many.testimonials({
			alias: "testimonials_image_directusFiles_id"
		}),
		userProfiles: r.many.userProfile(),
		videosMedia: r.many.videos({
			alias: "videos_media_directusFiles_id"
		}),
		videosThumbnail: r.many.videos({
			alias: "videos_thumbnail_directusFiles_id"
		}),
	},
	directusUsers: {
		announcementsUserCreated: r.many.announcements({
			alias: "announcements_userCreated_directusUsers_id"
		}),
		announcementsUserUpdated: r.many.announcements({
			alias: "announcements_userUpdated_directusUsers_id"
		}),
		articles: r.many.articles(),
		blockButtonsUserCreated: r.many.blockButton({
			alias: "blockButton_userCreated_directusUsers_id"
		}),
		blockButtonsUserUpdated: r.many.blockButton({
			alias: "blockButton_userUpdated_directusUsers_id"
		}),
		blockColumnsRowsUserCreated: r.many.blockColumnsRows({
			alias: "blockColumnsRows_userCreated_directusUsers_id"
		}),
		blockColumnsRowsUserUpdated: r.many.blockColumnsRows({
			alias: "blockColumnsRows_userUpdated_directusUsers_id"
		}),
		blockGalleryFilesUserCreated: r.many.blockGalleryFiles({
			alias: "blockGalleryFiles_userCreated_directusUsers_id"
		}),
		blockGalleryFilesUserUpdated: r.many.blockGalleryFiles({
			alias: "blockGalleryFiles_userUpdated_directusUsers_id"
		}),
		blockTestimonialSliderItemsUserCreated: r.many.blockTestimonialSliderItems({
			alias: "blockTestimonialSliderItems_userCreated_directusUsers_id"
		}),
		blockTestimonialSliderItemsUserUpdated: r.many.blockTestimonialSliderItems({
			alias: "blockTestimonialSliderItems_userUpdated_directusUsers_id"
		}),
		calendars: r.many.calendar(),
		carts: r.many.cart(),
		chatsUserCreated: r.many.chat({
			alias: "chat_userCreated_directusUsers_id"
		}),
		chatsUserUpdated: r.many.chat({
			alias: "chat_userUpdated_directusUsers_id"
		}),
		circlesDirectusUsers: r.many.circlesDirectusUsers(),
		comments: r.many.comments(),
		contactsUserCreated: r.many.contacts({
			alias: "contacts_userCreated_directusUsers_id"
		}),
		contactsUser: r.one.contacts({
			alias: "contacts_user_directusUsers_id"
		}),
		contactsUserUpdated: r.many.contacts({
			alias: "contacts_userUpdated_directusUsers_id"
		}),
		conversationsUserCreated: r.many.conversations({
			alias: "conversations_userCreated_directusUsers_id"
		}),
		conversationsUserUpdated: r.many.conversations({
			alias: "conversations_userUpdated_directusUsers_id"
		}),
		crossSellProducts: r.many.crossSellProducts(),
		directusAccesses: r.many.directusAccess(),
		directusDashboardsUserCreated: r.many.directusDashboards({
			alias: "directusDashboards_userCreated_directusUsers_id"
		}),
		directusDeploymentsViaDirectusDeploymentProjects: r.many.directusDeployments({
			alias: "directusDeployments_id_directusUsers_id_via_directusDeploymentProjects"
		}),
		directusDeploymentProjects: r.many.directusDeploymentProjects(),
		directusDeploymentsUserCreated: r.many.directusDeployments({
			alias: "directusDeployments_userCreated_directusUsers_id"
		}),
		directusFilesModifiedBy: r.many.directusFiles({
			alias: "directusFiles_modifiedBy_directusUsers_id"
		}),
		directusFilesUploadedBy: r.many.directusFiles({
			alias: "directusFiles_uploadedBy_directusUsers_id"
		}),
		directusFlows: r.many.directusFlows(),
		directusOauthClientsViaDirectusOauthCodes: r.many.directusOauthClients({
			alias: "directusOauthClients_clientId_directusUsers_id_via_directusOauthCodes"
		}),
		directusOauthClientsViaDirectusOauthConsents: r.many.directusOauthClients({
			alias: "directusOauthClients_clientId_directusUsers_id_via_directusOauthConsents"
		}),
		directusOauthClientsViaDirectusOauthTokens: r.many.directusOauthClients({
			alias: "directusOauthClients_clientId_directusUsers_id_via_directusOauthTokens"
		}),
		directusOperations: r.many.directusOperations(),
		directusDashboardsViaDirectusPanels: r.many.directusDashboards({
			alias: "directusDashboards_id_directusUsers_id_via_directusPanels"
		}),
		directusRoles: r.many.directusRoles({
			alias: "directusRoles_id_directusUsers_id_via_directusPresets"
		}),
		directusSessions: r.many.directusSessions(),
		directusShares: r.many.directusShares(),
		directusRole: r.one.directusRoles({
			from: r.directusUsers.role,
			to: r.directusRoles.id,
			alias: "directusUsers_role_directusRoles_id"
		}),
		directusVersionsUserCreated: r.many.directusVersions({
			alias: "directusVersions_userCreated_directusUsers_id"
		}),
		directusVersionsUserUpdated: r.many.directusVersions({
			alias: "directusVersions_userUpdated_directusUsers_id"
		}),
		eventsUserCreated: r.many.events({
			alias: "events_userCreated_directusUsers_id"
		}),
		eventsUserUpdated: r.many.events({
			alias: "events_userUpdated_directusUsers_id"
		}),
		eventsViaEventsDirectusUsers: r.many.events({
			from: r.directusUsers.id.through(r.eventsDirectusUsers.directusUsersId),
			to: r.events.id.through(r.eventsDirectusUsers.eventsId),
			alias: "directusUsers_id_events_id_via_eventsDirectusUsers"
		}),
		faqs: r.many.faqs({
			from: r.directusUsers.id.through(r.faqsDirectusUsers.directusUsersId),
			to: r.faqs.id.through(r.faqsDirectusUsers.faqsId)
		}),
		gamificationsAnniversaries: r.many.gamification({
			alias: "gamification_anniversaries_directusUsers_id"
		}),
		gamificationsBirthdays: r.many.gamification({
			alias: "gamification_birthdays_directusUsers_id"
		}),
		gamificationsLeaderboards: r.many.gamification({
			alias: "gamification_leaderboards_directusUsers_id"
		}),
		gamificationsNominationUser: r.many.gamification({
			alias: "gamification_nominationUser_directusUsers_id"
		}),
		gamificationsUserCreated: r.many.gamification({
			alias: "gamification_userCreated_directusUsers_id"
		}),
		gamificationsUserUpdated: r.many.gamification({
			alias: "gamification_userUpdated_directusUsers_id"
		}),
		gamificationsViaGamificationDirectusUsers: r.many.gamification({
			from: r.directusUsers.id.through(r.gamificationDirectusUsers.directusUsersId),
			to: r.gamification.id.through(r.gamificationDirectusUsers.gamificationId),
			alias: "directusUsers_id_gamification_id_via_gamificationDirectusUsers"
		}),
		helpArticlesOwner: r.many.helpArticles({
			alias: "helpArticles_owner_directusUsers_id"
		}),
		helpArticlesUserCreated: r.many.helpArticles({
			alias: "helpArticles_userCreated_directusUsers_id"
		}),
		helpArticlesUserUpdated: r.many.helpArticles({
			alias: "helpArticles_userUpdated_directusUsers_id"
		}),
		inboxesUserCreated: r.many.inbox({
			alias: "inbox_userCreated_directusUsers_id"
		}),
		inboxesUserUpdated: r.many.inbox({
			alias: "inbox_userUpdated_directusUsers_id"
		}),
		incentives: r.many.incentives(),
		listItemsUserCreated: r.many.listItems({
			alias: "listItems_userCreated_directusUsers_id"
		}),
		listItemsUserUpdated: r.many.listItems({
			alias: "listItems_userUpdated_directusUsers_id"
		}),
		listItemsViaListItemsDirectusUsers: r.many.listItems({
			from: r.directusUsers.id.through(r.listItemsDirectusUsers.directusUsersId),
			to: r.listItems.id.through(r.listItemsDirectusUsers.listItemsId),
			alias: "directusUsers_id_listItems_id_via_listItemsDirectusUsers"
		}),
		listsTemplates: r.many.listsTemplate({
			from: r.directusUsers.id.through(r.listsTemplateDirectusUsers.directusUsersId),
			to: r.listsTemplate.id.through(r.listsTemplateDirectusUsers.listsTemplateId)
		}),
		mediaUserCreated: r.many.media({
			alias: "media_userCreated_directusUsers_id"
		}),
		mediaUser: r.many.media({
			alias: "media_user_directusUsers_id"
		}),
		mediaUserUpdated: r.many.media({
			alias: "media_userUpdated_directusUsers_id"
		}),
		mediaFoldersUserCreated: r.many.mediaFolders({
			alias: "mediaFolders_userCreated_directusUsers_id"
		}),
		mediaFoldersUser: r.many.mediaFolders({
			alias: "mediaFolders_user_directusUsers_id"
		}),
		mediaFoldersUserUpdated: r.many.mediaFolders({
			alias: "mediaFolders_userUpdated_directusUsers_id"
		}),
		mediaFoldersViaMediaFoldersDirectusUsers: r.many.mediaFolders({
			from: r.directusUsers.id.through(r.mediaFoldersDirectusUsers.directusUsersId),
			to: r.mediaFolders.id.through(r.mediaFoldersDirectusUsers.mediaFoldersId),
			alias: "directusUsers_id_mediaFolders_id_via_mediaFoldersDirectusUsers"
		}),
		notifications: r.many.notifications(),
		orders: r.many.orders(),
		organizationAddressesUserCreated: r.many.organizationAddresses({
			alias: "organizationAddresses_userCreated_directusUsers_id"
		}),
		organizationAddressesUserUpdated: r.many.organizationAddresses({
			alias: "organizationAddresses_userUpdated_directusUsers_id"
		}),
		organizationsOwner: r.many.organizations({
			alias: "organizations_owner_directusUsers_id"
		}),
		organizationsUserCreated: r.many.organizations({
			alias: "organizations_userCreated_directusUsers_id"
		}),
		organizationsUserUpdated: r.many.organizations({
			alias: "organizations_userUpdated_directusUsers_id"
		}),
		osActivitiesAssignedTo: r.many.osActivities({
			alias: "osActivities_assignedTo_directusUsers_id"
		}),
		osActivitiesUserCreated: r.many.osActivities({
			alias: "osActivities_userCreated_directusUsers_id"
		}),
		osActivitiesUserUpdated: r.many.osActivities({
			alias: "osActivities_userUpdated_directusUsers_id"
		}),
		osDealsOwner: r.many.osDeals({
			alias: "osDeals_owner_directusUsers_id"
		}),
		osDealsUserCreated: r.many.osDeals({
			alias: "osDeals_userCreated_directusUsers_id"
		}),
		osDealsUserUpdated: r.many.osDeals({
			alias: "osDeals_userUpdated_directusUsers_id"
		}),
		osExpensesUserCreated: r.many.osExpenses({
			alias: "osExpenses_userCreated_directusUsers_id"
		}),
		osExpensesUserSubmitted: r.many.osExpenses({
			alias: "osExpenses_userSubmitted_directusUsers_id"
		}),
		osExpensesUserUpdated: r.many.osExpenses({
			alias: "osExpenses_userUpdated_directusUsers_id"
		}),
		osInvoiceItemsUserCreated: r.many.osInvoiceItems({
			alias: "osInvoiceItems_userCreated_directusUsers_id"
		}),
		osInvoiceItemsUserUpdated: r.many.osInvoiceItems({
			alias: "osInvoiceItems_userUpdated_directusUsers_id"
		}),
		osInvoicesUserCreated: r.many.osInvoices({
			alias: "osInvoices_userCreated_directusUsers_id"
		}),
		osInvoicesUserUpdated: r.many.osInvoices({
			alias: "osInvoices_userUpdated_directusUsers_id"
		}),
		osItemsUserCreated: r.many.osItems({
			alias: "osItems_userCreated_directusUsers_id"
		}),
		osItemsUserUpdated: r.many.osItems({
			alias: "osItems_userUpdated_directusUsers_id"
		}),
		osPaymentsUserCreated: r.many.osPayments({
			alias: "osPayments_userCreated_directusUsers_id"
		}),
		osPaymentsUserUpdated: r.many.osPayments({
			alias: "osPayments_userUpdated_directusUsers_id"
		}),
		osProjectUpdatesUserCreated: r.many.osProjectUpdates({
			alias: "osProjectUpdates_userCreated_directusUsers_id"
		}),
		osProjectUpdatesUserUpdated: r.many.osProjectUpdates({
			alias: "osProjectUpdates_userUpdated_directusUsers_id"
		}),
		osProjectsOwner: r.many.osProjects({
			alias: "osProjects_owner_directusUsers_id"
		}),
		osProjectsUserCreated: r.many.osProjects({
			alias: "osProjects_userCreated_directusUsers_id"
		}),
		osProjectsUserUpdated: r.many.osProjects({
			alias: "osProjects_userUpdated_directusUsers_id"
		}),
		osProposalApprovalsUserCreated: r.many.osProposalApprovals({
			alias: "osProposalApprovals_userCreated_directusUsers_id"
		}),
		osProposalApprovalsUserUpdated: r.many.osProposalApprovals({
			alias: "osProposalApprovals_userUpdated_directusUsers_id"
		}),
		osProposalBlocksUserCreated: r.many.osProposalBlocks({
			alias: "osProposalBlocks_userCreated_directusUsers_id"
		}),
		osProposalBlocksUserUpdated: r.many.osProposalBlocks({
			alias: "osProposalBlocks_userUpdated_directusUsers_id"
		}),
		osProposalsUserCreated: r.many.osProposals({
			alias: "osProposals_userCreated_directusUsers_id"
		}),
		osProposalsUserUpdated: r.many.osProposals({
			alias: "osProposals_userUpdated_directusUsers_id"
		}),
		osTasksAssignedTo: r.many.osTasks({
			alias: "osTasks_assignedTo_directusUsers_id"
		}),
		osTasksUserCreated: r.many.osTasks({
			alias: "osTasks_userCreated_directusUsers_id"
		}),
		osTasksUserUpdated: r.many.osTasks({
			alias: "osTasks_userUpdated_directusUsers_id"
		}),
		payments: r.many.payments({
			from: r.directusUsers.id.through(r.paymentsDirectusUsers.directusUsersId),
			to: r.payments.id.through(r.paymentsDirectusUsers.paymentsId)
		}),
		pollsAuthor: r.many.polls({
			alias: "polls_author_directusUsers_id"
		}),
		pollsUserCreated: r.many.polls({
			alias: "polls_userCreated_directusUsers_id"
		}),
		pollsUserUpdated: r.many.polls({
			alias: "polls_userUpdated_directusUsers_id"
		}),
		posts: r.many.posts(),
		profiles: r.one.profiles(),
		projectBoards: r.many.projectBoard({
			from: r.directusUsers.id.through(r.projectBoardDirectusUsers.directusUsersId),
			to: r.projectBoard.id.through(r.projectBoardDirectusUsers.projectBoardId)
		}),
		projectsUserCreated: r.many.projects({
			alias: "projects_userCreated_directusUsers_id"
		}),
		projectsUserUpdated: r.many.projects({
			alias: "projects_userUpdated_directusUsers_id"
		}),
		projectsViaProjectsDirectusUsers: r.many.projects({
			from: r.directusUsers.id.through(r.projectsDirectusUsers.directusUsersId),
			to: r.projects.id.through(r.projectsDirectusUsers.projectsId),
			alias: "directusUsers_id_projects_id_via_projectsDirectusUsers"
		}),
		radiosUserCreated: r.many.radios({
			alias: "radios_userCreated_directusUsers_id"
		}),
		radiosUserUpdated: r.many.radios({
			alias: "radios_userUpdated_directusUsers_id"
		}),
		reactionsUser: r.many.reactions({
			alias: "reactions_user_directusUsers_id"
		}),
		reactionsUserId: r.many.reactions({
			alias: "reactions_userId_directusUsers_id"
		}),
		relatedProducts: r.many.relatedProducts(),
		shippingAddresses: r.many.shippingAddresses({
			from: r.directusUsers.id.through(r.shippingAddressesDirectusUsers.directusUsersId),
			to: r.shippingAddresses.id.through(r.shippingAddressesDirectusUsers.shippingAddressesId)
		}),
		showcases: r.many.showcases(),
		spacesOwner: r.many.spaces({
			alias: "spaces_owner_directusUsers_id"
		}),
		spacesUserCreated: r.many.spaces({
			alias: "spaces_userCreated_directusUsers_id"
		}),
		spacesUserUpdated: r.many.spaces({
			alias: "spaces_userUpdated_directusUsers_id"
		}),
		spacesViaSpacesDirectusUsers: r.many.spaces({
			from: r.directusUsers.id.through(r.spacesDirectusUsers.directusUsersId),
			to: r.spaces.id.through(r.spacesDirectusUsers.spacesId),
			alias: "directusUsers_id_spaces_id_via_spacesDirectusUsers"
		}),
		teamsUserCreated: r.many.team({
			alias: "team_userCreated_directusUsers_id"
		}),
		teamsUserUpdated: r.many.team({
			alias: "team_userUpdated_directusUsers_id"
		}),
		testimonialsUserCreated: r.many.testimonials({
			alias: "testimonials_userCreated_directusUsers_id"
		}),
		testimonialsUserUpdated: r.many.testimonials({
			alias: "testimonials_userUpdated_directusUsers_id"
		}),
		userProfilesUser: r.many.userProfile({
			alias: "userProfile_user_directusUsers_id"
		}),
		userProfilesUserUpdated: r.many.userProfile({
			alias: "userProfile_userUpdated_directusUsers_id"
		}),
		videosUserCreated: r.many.videos({
			alias: "videos_userCreated_directusUsers_id"
		}),
		videosUser: r.many.videos({
			alias: "videos_user_directusUsers_id"
		}),
		videosUserUpdated: r.many.videos({
			alias: "videos_userUpdated_directusUsers_id"
		}),
		websites: r.many.websites(),
	},
	categories: {
		articles: r.many.articles(),
		brands: r.many.brands(),
		seoRelation: r.one.seo({
			from: r.categories.seo,
			to: r.seo.id
		}),
		departmentsViaCategoriesDepartments: r.many.departments({
			from: r.categories.id.through(r.categoriesDepartments.categoriesId),
			to: r.departments.id.through(r.categoriesDepartments.departmentsId),
			alias: "categories_id_departments_id_via_categoriesDepartments"
		}),
		postgresstores: r.many.postgresstores({
			from: r.categories.id.through(r.categoriesPostgresstores.categoriesId),
			to: r.postgresstores.id.through(r.categoriesPostgresstores.postgresstoresId)
		}),
		shorts: r.many.shorts({
			from: r.categories.id.through(r.categoriesShorts.categoriesId),
			to: r.shorts.id.through(r.categoriesShorts.shortsId)
		}),
		departmentsViaDepartmentsCategories: r.many.departments({
			from: r.categories.id.through(r.departmentsCategories.categoriesId),
			to: r.departments.id.through(r.departmentsCategories.departmentsId),
			alias: "categories_id_departments_id_via_departmentsCategories"
		}),
		integrations: r.many.integrations({
			from: r.categories.id.through(r.integrationsCategories.categoriesId),
			to: r.integrations.id.through(r.integrationsCategories.integrationsId)
		}),
		lists: r.many.lists({
			from: r.categories.id.through(r.listsCategories.categoriesId),
			to: r.lists.id.through(r.listsCategories.listsId)
		}),
		listsTypes: r.many.listsType({
			from: r.categories.id.through(r.listsTypeCategories.categoriesId),
			to: r.listsType.id.through(r.listsTypeCategories.listsTypeId)
		}),
		outlets: r.many.outlets({
			from: r.categories.id.through(r.outletsCategories.categoriesId),
			to: r.outlets.id.through(r.outletsCategories.outletsId)
		}),
		platforms: r.many.platform({
			from: r.categories.id.through(r.platformCategories.categoriesId),
			to: r.platform.id.through(r.platformCategories.platformId)
		}),
		products: r.many.products({
			from: r.categories.id.through(r.productsCategories.categoriesId),
			to: r.products.id.through(r.productsCategories.productsId)
		}),
		radios: r.many.radios({
			from: r.categories.id.through(r.radiosCategories.categoriesId),
			to: r.radios.id.through(r.radiosCategories.radiosId)
		}),
		shops: r.many.shops({
			from: r.categories.id.through(r.shopsCategories.categoriesId),
			to: r.shops.id.through(r.shopsCategories.shopsId)
		}),
		sitePreferenceCategories: r.many.sitePreferenceCategories(),
		tags: r.many.tags({
			from: r.categories.id.through(r.tagsCategories.categoriesId),
			to: r.tags.id.through(r.tagsCategories.tagsId)
		}),
		videos: r.many.videos({
			from: r.categories.id.through(r.videosCategories.categoriesId),
			to: r.videos.id.through(r.videosCategories.videosId)
		}),
	},
	comments: {
		articles: r.many.articles(),
		calendars: r.many.calendar(),
		directusUser: r.one.directusUsers({
			from: r.comments.user,
			to: r.directusUsers.id
		}),
		commentsDirectusUsers: r.many.commentsDirectusUsers(),
		products: r.many.products({
			from: r.comments.id.through(r.commentsProducts.commentsId),
			to: r.products.id.through(r.commentsProducts.productsId)
		}),
		reactionsViaCommentsReactions: r.many.reactions({
			from: r.comments.id.through(r.commentsReactions.commentsId),
			to: r.reactions.id.through(r.commentsReactions.reactionsId),
			alias: "comments_id_reactions_id_via_commentsReactions"
		}),
		shorts: r.many.shorts({
			from: r.comments.id.through(r.commentsShorts.commentsId),
			to: r.shorts.id.through(r.commentsShorts.shortsId)
		}),
		projectBoards: r.many.projectBoard({
			from: r.comments.id.through(r.projectBoardComments.commentsId),
			to: r.projectBoard.id.through(r.projectBoardComments.projectBoardId)
		}),
		projects: r.many.projects({
			from: r.comments.id.through(r.projectsComments.commentsId),
			to: r.projects.id.through(r.projectsComments.projectsId)
		}),
		reactionsViaReactionsComments: r.many.reactions({
			from: r.comments.id.through(r.reactionsComments.commentsId),
			to: r.reactions.id.through(r.reactionsComments.reactionsId),
			alias: "comments_id_reactions_id_via_reactionsComments"
		}),
		reports: r.many.report({
			from: r.comments.id.through(r.reportComments.commentsId),
			to: r.report.id.through(r.reportComments.reportId)
		}),
		shops: r.many.shops({
			from: r.comments.id.through(r.shopsComments.commentsId),
			to: r.shops.id.through(r.shopsComments.shopsId)
		}),
		videos: r.many.videos({
			from: r.comments.id.through(r.videosComments.commentsId),
			to: r.videos.id.through(r.videosComments.videosId)
		}),
	},
	departments: {
		articles: r.many.articles(),
		brands: r.many.brands(),
		categoriesViaCategoriesDepartments: r.many.categories({
			alias: "categories_id_departments_id_via_categoriesDepartments"
		}),
		charts: r.many.charts(),
		currencies: r.many.currency(),
		categoriesViaDepartmentsCategories: r.many.categories({
			alias: "categories_id_departments_id_via_departmentsCategories"
		}),
		collections: r.many.collections(),
		productsViaDepartmentsProducts: r.many.products({
			from: r.departments.id.through(r.departmentsProducts.departmentsId),
			to: r.products.id.through(r.departmentsProducts.productsId),
			alias: "departments_id_products_id_via_departmentsProducts"
		}),
		shorts: r.many.shorts({
			from: r.departments.id.through(r.departmentsShorts.departmentsId),
			to: r.shorts.id.through(r.departmentsShorts.shortsId)
		}),
		showcases: r.many.showcases({
			from: r.departments.id.through(r.departmentsShowcases.departmentsId),
			to: r.showcases.id.through(r.departmentsShowcases.showcasesId)
		}),
		integrations: r.many.integrations({
			from: r.departments.id.through(r.integrationsDepartments.departmentsId),
			to: r.integrations.id.through(r.integrationsDepartments.integrationsId)
		}),
		lists: r.many.lists({
			from: r.departments.id.through(r.listsDepartments.departmentsId),
			to: r.lists.id.through(r.listsDepartments.listsId)
		}),
		musicchartDepartments: r.many.musicchartDepartments(),
		posts: r.many.posts({
			from: r.departments.id.through(r.postsDepartments.departmentsId),
			to: r.posts.id.through(r.postsDepartments.postsId)
		}),
		productsViaProductsDepartments: r.many.products({
			from: r.departments.id.through(r.productsDepartments.departmentsId),
			to: r.products.id.through(r.productsDepartments.productsId),
			alias: "departments_id_products_id_via_productsDepartments"
		}),
		radios: r.many.radios({
			from: r.departments.id.through(r.radiosDepartments.departmentsId),
			to: r.radios.id.through(r.radiosDepartments.radiosId)
		}),
		shops: r.many.shops({
			from: r.departments.id.through(r.shopsDepartments.departmentsId),
			to: r.shops.id.through(r.shopsDepartments.shopsId)
		}),
		sitePreferenceDepartments: r.many.sitePreferenceDepartments(),
		spaces: r.many.spaces({
			from: r.departments.id.through(r.spacesDepartments.departmentsId),
			to: r.spaces.id.through(r.spacesDepartments.spacesId)
		}),
		tags: r.many.tags({
			from: r.departments.id.through(r.tagsDepartments.departmentsId),
			to: r.tags.id.through(r.tagsDepartments.tagsId)
		}),
		videos: r.many.videos({
			from: r.departments.id.through(r.videosDepartments.departmentsId),
			to: r.videos.id.through(r.videosDepartments.videosId)
		}),
	},
	attributes: {
		productTypes: r.many.productTypes({
			from: r.attributes.id.through(r.attributesProductTypes.attributesId),
			to: r.productTypes.id.through(r.attributesProductTypes.productTypesId)
		}),
		productsViaAttributesProducts: r.many.products({
			from: r.attributes.id.through(r.attributesProducts.attributesId),
			to: r.products.id.through(r.attributesProducts.productsId),
			alias: "attributes_id_products_id_via_attributesProducts"
		}),
		integrations: r.many.integrations({
			from: r.attributes.id.through(r.integrationsAttributes.attributesId),
			to: r.integrations.id.through(r.integrationsAttributes.integrationsId)
		}),
		productsViaProductAttributes: r.many.products({
			from: r.attributes.id.through(r.productAttributes.attributeId),
			to: r.products.id.through(r.productAttributes.productId),
			alias: "attributes_id_products_id_via_productAttributes"
		}),
		productsViaProductsAttributes: r.many.products({
			from: r.attributes.id.through(r.productsAttributes.attributesId),
			to: r.products.id.through(r.productsAttributes.productsId),
			alias: "attributes_id_products_id_via_productsAttributes"
		}),
		videos: r.many.videos(),
	},
	productTypes: {
		attributes: r.many.attributes(),
		integrations: r.many.integrations(),
		products: r.many.products({
			from: r.productTypes.id.through(r.productTypesProducts.productTypesId),
			to: r.products.id.through(r.productTypesProducts.productsId)
		}),
		videos: r.many.videos({
			from: r.productTypes.id.through(r.videosProductTypes.productTypesId),
			to: r.videos.id.through(r.videosProductTypes.videosId)
		}),
	},
	auctionLots: {
		product: r.one.products({
			from: r.auctionLots.productId,
			to: r.products.id
		}),
		bids: r.many.bids(),
	},
	bids: {
		auctionLot: r.one.auctionLots({
			from: r.bids.lotId,
			to: r.auctionLots.id
		}),
	},
	blockButton: {
		blockButtonGroup: r.one.blockButtonGroup({
			from: r.blockButton.buttonGroup,
			to: r.blockButtonGroup.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.blockButton.userCreated,
			to: r.directusUsers.id,
			alias: "blockButton_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.blockButton.userUpdated,
			to: r.directusUsers.id,
			alias: "blockButton_userUpdated_directusUsers_id"
		}),
	},
	blockButtonGroup: {
		blockButtons: r.many.blockButton(),
		blockColumnsRows: r.many.blockColumnsRows(),
		blockCtas: r.many.blockCta(),
		directusFiles: r.many.directusFiles({
			from: r.blockButtonGroup.id.through(r.blockHero.buttonGroup),
			to: r.directusFiles.id.through(r.blockHero.image)
		}),
		blockStepItems: r.many.blockStepItems(),
	},
	blockColumnsRows: {
		blockColumn: r.one.blockColumns({
			from: r.blockColumnsRows.blockColumns,
			to: r.blockColumns.id
		}),
		blockButtonGroup: r.one.blockButtonGroup({
			from: r.blockColumnsRows.buttonGroup,
			to: r.blockButtonGroup.id
		}),
		directusFile: r.one.directusFiles({
			from: r.blockColumnsRows.image,
			to: r.directusFiles.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.blockColumnsRows.userCreated,
			to: r.directusUsers.id,
			alias: "blockColumnsRows_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.blockColumnsRows.userUpdated,
			to: r.directusUsers.id,
			alias: "blockColumnsRows_userUpdated_directusUsers_id"
		}),
	},
	blockColumns: {
		blockColumnsRows: r.many.blockColumnsRows(),
	},
	blockCta: {
		blockButtonGroup: r.one.blockButtonGroup({
			from: r.blockCta.buttonGroup,
			to: r.blockButtonGroup.id
		}),
	},
	blockForm: {
		formRelation: r.one.forms({
			from: r.blockForm.form,
			to: r.forms.id
		}),
	},
	forms: {
		blockForms: r.many.blockForm(),
		inboxes: r.many.inbox(),
		osTasks: r.many.osTasks(),
	},
	blockGalleryFiles: {
		blockGallery: r.one.blockGallery({
			from: r.blockGalleryFiles.blockGalleryId,
			to: r.blockGallery.id
		}),
		directusFile: r.one.directusFiles({
			from: r.blockGalleryFiles.directusFilesId,
			to: r.directusFiles.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.blockGalleryFiles.userCreated,
			to: r.directusUsers.id,
			alias: "blockGalleryFiles_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.blockGalleryFiles.userUpdated,
			to: r.directusUsers.id,
			alias: "blockGalleryFiles_userUpdated_directusUsers_id"
		}),
	},
	blockGallery: {
		blockGalleryFiles: r.many.blockGalleryFiles(),
	},
	blockLogocloud: {
		directusFiles: r.many.directusFiles({
			from: r.blockLogocloud.id.through(r.blockLogocloudLogos.blockLogocloudId),
			to: r.directusFiles.id.through(r.blockLogocloudLogos.directusFilesId)
		}),
	},
	blockStepItems: {
		blockStep: r.one.blockSteps({
			from: r.blockStepItems.blockSteps,
			to: r.blockSteps.id
		}),
		blockButtonGroup: r.one.blockButtonGroup({
			from: r.blockStepItems.buttonGroup,
			to: r.blockButtonGroup.id
		}),
		directusFile: r.one.directusFiles({
			from: r.blockStepItems.image,
			to: r.directusFiles.id
		}),
	},
	blockSteps: {
		blockStepItems: r.many.blockStepItems(),
	},
	blockTestimonialSliderItems: {
		blockTestimonial: r.one.blockTestimonials({
			from: r.blockTestimonialSliderItems.blockTestimonialSliderId,
			to: r.blockTestimonials.id
		}),
		testimonial: r.one.testimonials({
			from: r.blockTestimonialSliderItems.testimonialsId,
			to: r.testimonials.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.blockTestimonialSliderItems.userCreated,
			to: r.directusUsers.id,
			alias: "blockTestimonialSliderItems_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.blockTestimonialSliderItems.userUpdated,
			to: r.directusUsers.id,
			alias: "blockTestimonialSliderItems_userUpdated_directusUsers_id"
		}),
	},
	blockTestimonials: {
		blockTestimonialSliderItems: r.many.blockTestimonialSliderItems(),
	},
	testimonials: {
		blockTestimonialSliderItems: r.many.blockTestimonialSliderItems(),
		directusFileCompanyLogo: r.one.directusFiles({
			from: r.testimonials.companyLogo,
			to: r.directusFiles.id,
			alias: "testimonials_companyLogo_directusFiles_id"
		}),
		directusFileImage: r.one.directusFiles({
			from: r.testimonials.image,
			to: r.directusFiles.id,
			alias: "testimonials_image_directusFiles_id"
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.testimonials.userCreated,
			to: r.directusUsers.id,
			alias: "testimonials_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.testimonials.userUpdated,
			to: r.directusUsers.id,
			alias: "testimonials_userUpdated_directusUsers_id"
		}),
	},
	blockVideo: {
		directusFile: r.one.directusFiles({
			from: r.blockVideo.videoFile,
			to: r.directusFiles.id
		}),
	},
	brands: {
		directusFile: r.one.directusFiles({
			from: r.brands.image,
			to: r.directusFiles.id
		}),
		categories: r.many.categories({
			from: r.brands.id.through(r.brandsCategories.brandsId),
			to: r.categories.id.through(r.brandsCategories.categoriesId)
		}),
		departments: r.many.departments({
			from: r.brands.id.through(r.brandsDepartments.brandsId),
			to: r.departments.id.through(r.brandsDepartments.departmentsId)
		}),
		manufacturers: r.many.manufacturer({
			from: r.brands.id.through(r.brandsManufacturer.brandsId),
			to: r.manufacturer.id.through(r.brandsManufacturer.manufacturerId)
		}),
		products: r.many.products({
			from: r.brands.id.through(r.brandsProducts.brandsId),
			to: r.products.id.through(r.brandsProducts.productsId)
		}),
		shorts: r.many.shorts({
			from: r.brands.id.through(r.brandsShorts.brandsId),
			to: r.shorts.id.through(r.brandsShorts.shortsId)
		}),
		collections: r.many.collections({
			from: r.brands.id.through(r.collectionsBrands.brandsId),
			to: r.collections.id.through(r.collectionsBrands.collectionsId)
		}),
	},
	manufacturer: {
		brands: r.many.brands(),
		countries: r.many.countries(),
		products: r.many.products({
			from: r.manufacturer.id.through(r.productsManufacturer.manufacturerId),
			to: r.products.id.through(r.productsManufacturer.productsId)
		}),
		videos: r.many.videos({
			from: r.manufacturer.id.through(r.videosManufacturer.manufacturerId),
			to: r.videos.id.through(r.videosManufacturer.videosId)
		}),
	},
	shorts: {
		brands: r.many.brands(),
		categories: r.many.categories(),
		comments: r.many.comments(),
		departments: r.many.departments(),
		lists: r.many.lists(),
		outlets: r.many.outlets(),
		reactions: r.many.reactions(),
		directusFile: r.one.directusFiles({
			from: r.shorts.video,
			to: r.directusFiles.id,
			alias: "shorts_video_directusFiles_id"
		}),
		shortsDirectusUsers: r.many.shortsDirectusUsers(),
		directusFiles: r.many.directusFiles({
			alias: "directusFiles_id_shorts_id_via_shortsFiles"
		}),
		products: r.many.products(),
		spaces: r.many.spaces({
			from: r.shorts.id.through(r.shortsSpaces.shortsId),
			to: r.spaces.id.through(r.shortsSpaces.spacesId)
		}),
		tags: r.many.tags({
			from: r.shorts.id.through(r.tagsShorts.shortsId),
			to: r.tags.id.through(r.tagsShorts.tagsId)
		}),
	},
	calendar: {
		directusFile: r.one.directusFiles({
			from: r.calendar.image,
			to: r.directusFiles.id
		}),
		comments: r.many.comments({
			from: r.calendar.id.through(r.calendarComments.calendarId),
			to: r.comments.id.through(r.calendarComments.commentsId)
		}),
		directusUsers: r.many.directusUsers({
			from: r.calendar.id.through(r.calendarDirectusUsers.calendarId),
			to: r.directusUsers.id.through(r.calendarDirectusUsers.directusUsersId)
		}),
		events: r.many.events({
			from: r.calendar.id.through(r.calendarEvents.calendarId),
			to: r.events.id.through(r.calendarEvents.eventsId)
		}),
		integrations: r.many.integrations({
			from: r.calendar.id.through(r.calendarIntegrations.calendarId),
			to: r.integrations.id.through(r.calendarIntegrations.integrationsId)
		}),
		lists: r.many.lists({
			from: r.calendar.id.through(r.calendarLists.calendarId),
			to: r.lists.id.through(r.calendarLists.listsId)
		}),
		projects: r.many.projects({
			from: r.calendar.id.through(r.projectsCalendar.calendarId),
			to: r.projects.id.through(r.projectsCalendar.projectsId)
		}),
	},
	events: {
		calendars: r.many.calendar(),
		directusFile: r.one.directusFiles({
			from: r.events.image,
			to: r.directusFiles.id,
			alias: "events_image_directusFiles_id"
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.events.userCreated,
			to: r.directusUsers.id,
			alias: "events_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.events.userUpdated,
			to: r.directusUsers.id,
			alias: "events_userUpdated_directusUsers_id"
		}),
		cities: r.many.cities(),
		countries: r.many.countries(),
		eventsCoupons: r.many.eventsCoupons(),
		directusUsers: r.many.directusUsers({
			alias: "directusUsers_id_events_id_via_eventsDirectusUsers"
		}),
		directusFiles: r.many.directusFiles({
			alias: "directusFiles_id_events_id_via_eventsFiles"
		}),
		invoices: r.many.invoices({
			from: r.events.id.through(r.eventsInvoices.eventsId),
			to: r.invoices.id.through(r.eventsInvoices.invoicesId)
		}),
		lists: r.many.lists({
			from: r.events.id.through(r.eventsLists.eventsId),
			to: r.lists.id.through(r.eventsLists.listsId)
		}),
		posts: r.many.posts({
			from: r.events.id.through(r.eventsPosts.eventsId),
			to: r.posts.id.through(r.eventsPosts.postsId)
		}),
		products: r.many.products({
			from: r.events.id.through(r.eventsProducts.eventsId),
			to: r.products.id.through(r.eventsProducts.productsId)
		}),
		states: r.many.states({
			from: r.events.id.through(r.eventsStates.eventsId),
			to: r.states.id.through(r.eventsStates.statesId)
		}),
		gamifications: r.many.gamification({
			from: r.events.id.through(r.gamificationEvents.eventsId),
			to: r.gamification.id.through(r.gamificationEvents.gamificationId)
		}),
		memberGroupsEvents: r.many.memberGroupsEvents(),
	},
	integrations: {
		calendars: r.many.calendar(),
		attributes: r.many.attributes(),
		categories: r.many.categories(),
		departments: r.many.departments(),
		directusFiles: r.many.directusFiles(),
		platforms: r.many.platform({
			from: r.integrations.id.through(r.integrationsPlatform.integrationsId),
			to: r.platform.id.through(r.integrationsPlatform.platformId)
		}),
		productTypes: r.many.productTypes({
			from: r.integrations.id.through(r.integrationsProductTypes.integrationsId),
			to: r.productTypes.id.through(r.integrationsProductTypes.productTypesId)
		}),
		ratings: r.many.ratings({
			from: r.integrations.id.through(r.integrationsRatings.integrationsId),
			to: r.ratings.id.through(r.integrationsRatings.ratingsId)
		}),
		reports: r.many.report({
			from: r.integrations.id.through(r.integrationsReport.integrationsId),
			to: r.report.id.through(r.integrationsReport.reportId)
		}),
		spaces: r.many.spaces({
			from: r.integrations.id.through(r.integrationsSpaces.integrationsId),
			to: r.spaces.id.through(r.integrationsSpaces.spacesId)
		}),
		tags: r.many.tags({
			from: r.integrations.id.through(r.integrationsTags.integrationsId),
			to: r.tags.id.through(r.integrationsTags.tagsId)
		}),
		projects: r.many.projects({
			from: r.integrations.id.through(r.projectsIntegrations.integrationsId),
			to: r.projects.id.through(r.projectsIntegrations.projectsId)
		}),
	},
	lists: {
		calendars: r.many.calendar(),
		events: r.many.events(),
		listItems: r.many.listItems(),
		listProducts: r.many.listProducts(),
		categories: r.many.categories(),
		departments: r.many.departments(),
		listsDirectusUsers: r.many.listsDirectusUsers(),
		directusFiles: r.many.directusFiles(),
		products: r.many.products({
			from: r.lists.id.through(r.listsProducts.listsId),
			to: r.products.id.through(r.listsProducts.productsId)
		}),
		shorts: r.many.shorts({
			from: r.lists.id.through(r.listsShorts.listsId),
			to: r.shorts.id.through(r.listsShorts.shortsId)
		}),
		templates: r.many.templates({
			from: r.lists.id.through(r.listsTemplates.listsId),
			to: r.templates.id.through(r.listsTemplates.templatesId)
		}),
		listsTypes: r.many.listsType({
			from: r.lists.id.through(r.listsTypeLists.listsId),
			to: r.listsType.id.through(r.listsTypeLists.listsTypeId)
		}),
		platforms: r.many.platform({
			from: r.lists.id.through(r.platformLists.listsId),
			to: r.platform.id.through(r.platformLists.platformId)
		}),
		projects: r.many.projects({
			from: r.lists.id.through(r.projectsLists.listsId),
			to: r.projects.id.through(r.projectsLists.projectsId)
		}),
		reactionsListId: r.many.reactions({
			alias: "reactions_listId_lists_id"
		}),
		reactionsViaReactionsLists: r.many.reactions({
			from: r.lists.id.through(r.reactionsLists.listsId),
			to: r.reactions.id.through(r.reactionsLists.reactionsId),
			alias: "lists_id_reactions_id_via_reactionsLists"
		}),
		spaces: r.many.spaces({
			from: r.lists.id.through(r.spacesLists.listsId),
			to: r.spaces.id.through(r.spacesLists.spacesId)
		}),
	},
	cartItems: {
		carts: r.many.cart(),
	},
	seo: {
		categories: r.many.categories(),
		pages: r.many.pages(),
		pagesBlogs: r.many.pagesBlog(),
		pagesProjects: r.many.pagesProjects(),
		posts: r.many.posts(),
	},
	postgresstores: {
		categories: r.many.categories(),
		collections: r.many.collections(),
		products: r.many.products({
			from: r.postgresstores.id.through(r.postgresstoresProducts.postgresstoresId),
			to: r.products.id.through(r.postgresstoresProducts.productsId)
		}),
		websites: r.many.websites({
			from: r.postgresstores.id.through(r.postgresstoresWebsites.postgresstoresId),
			to: r.websites.id.through(r.postgresstoresWebsites.websitesId)
		}),
		translations: r.many.translations({
			from: r.postgresstores.id.through(r.translationsPostgresstores.postgresstoresId),
			to: r.translations.id.through(r.translationsPostgresstores.translationsId)
		}),
	},
	charts: {
		productsViaChartEntries: r.many.products({
			from: r.charts.id.through(r.chartEntries.chartId),
			to: r.products.id.through(r.chartEntries.productId),
			alias: "charts_id_products_id_via_chartEntries"
		}),
		directusFile: r.one.directusFiles({
			from: r.charts.icon,
			to: r.directusFiles.id
		}),
		departments: r.many.departments({
			from: r.charts.id.through(r.chartsDepartments.chartsId),
			to: r.departments.id.through(r.chartsDepartments.departmentsId)
		}),
		productsViaChartsProducts: r.many.products({
			from: r.charts.id.through(r.chartsProducts.chartsId),
			to: r.products.id.through(r.chartsProducts.productsId),
			alias: "charts_id_products_id_via_chartsProducts"
		}),
		radios: r.many.radios({
			from: r.charts.id.through(r.chartsRadios.chartsId),
			to: r.radios.id.through(r.chartsRadios.radiosId)
		}),
	},
	radios: {
		charts: r.many.charts(),
		directusFileFile: r.one.directusFiles({
			from: r.radios.file,
			to: r.directusFiles.id,
			alias: "radios_file_directusFiles_id"
		}),
		directusFileImage: r.one.directusFiles({
			from: r.radios.image,
			to: r.directusFiles.id,
			alias: "radios_image_directusFiles_id"
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.radios.userCreated,
			to: r.directusUsers.id,
			alias: "radios_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.radios.userUpdated,
			to: r.directusUsers.id,
			alias: "radios_userUpdated_directusUsers_id"
		}),
		categories: r.many.categories(),
		departments: r.many.departments(),
		radiosMusiccharts: r.many.radiosMusicchart(),
	},
	chat: {
		directusFile: r.one.directusFiles({
			from: r.chat.image,
			to: r.directusFiles.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.chat.userCreated,
			to: r.directusUsers.id,
			alias: "chat_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.chat.userUpdated,
			to: r.directusUsers.id,
			alias: "chat_userUpdated_directusUsers_id"
		}),
	},
	circlesDirectusUsers: {
		directusUser: r.one.directusUsers({
			from: r.circlesDirectusUsers.directusUsersId,
			to: r.directusUsers.id
		}),
	},
	circlesPosts: {
		post: r.one.posts({
			from: r.circlesPosts.postsId,
			to: r.posts.id
		}),
	},
	posts: {
		circlesPosts: r.many.circlesPosts(),
		events: r.many.events(),
		feeds: r.many.feeds(),
		listItems: r.many.listItems(),
		memberGroupsPosts: r.many.memberGroupsPosts(),
		directusFileAudio: r.one.directusFiles({
			from: r.posts.audio,
			to: r.directusFiles.id,
			alias: "posts_audio_directusFiles_id"
		}),
		directusUser: r.one.directusUsers({
			from: r.posts.author,
			to: r.directusUsers.id
		}),
		directusFileImage: r.one.directusFiles({
			from: r.posts.image,
			to: r.directusFiles.id,
			alias: "posts_image_directusFiles_id"
		}),
		seoRelation: r.one.seo({
			from: r.posts.seo,
			to: r.seo.id
		}),
		departments: r.many.departments(),
		polls: r.many.polls(),
		reactionsPosts: r.many.reactions({
			alias: "reactions_posts_posts_id"
		}),
		reactionsViaReactionsPosts: r.many.reactions({
			from: r.posts.id.through(r.reactionsPosts.postsId),
			to: r.reactions.id.through(r.reactionsPosts.reactionsId),
			alias: "posts_id_reactions_id_via_reactionsPosts"
		}),
		reports: r.many.report({
			from: r.posts.id.through(r.reportPosts.postsId),
			to: r.report.id.through(r.reportPosts.reportId)
		}),
		spaces: r.many.spaces({
			from: r.posts.id.through(r.spacesPosts.postsId),
			to: r.spaces.id.through(r.spacesPosts.spacesId)
		}),
		tags: r.many.tags({
			from: r.posts.id.through(r.tagsPosts.postsId),
			to: r.tags.id.through(r.tagsPosts.tagsId)
		}),
		userFriends: r.many.userFriends({
			from: r.posts.id.through(r.userFriendsPosts.postsId),
			to: r.userFriends.id.through(r.userFriendsPosts.userFriendsId)
		}),
	},
	circlesProducts: {
		product: r.one.products({
			from: r.circlesProducts.productsId,
			to: r.products.id
		}),
	},
	citiesCountries: {
		city: r.one.cities({
			from: r.citiesCountries.citiesId,
			to: r.cities.id
		}),
	},
	citiesStates: {
		city: r.one.cities({
			from: r.citiesStates.citiesId,
			to: r.cities.id
		}),
	},
	collections: {
		brands: r.many.brands(),
		products: r.many.products({
			from: r.collections.id.through(r.collectionsProducts.collectionsId),
			to: r.products.id.through(r.collectionsProducts.productsId)
		}),
		spaces: r.many.spaces({
			from: r.collections.id.through(r.collectionsSpaces.collectionsId),
			to: r.spaces.id.through(r.collectionsSpaces.spacesId)
		}),
		departments: r.many.departments({
			from: r.collections.id.through(r.departmentsCollections.collectionsId),
			to: r.departments.id.through(r.departmentsCollections.departmentsId)
		}),
		postgresstores: r.many.postgresstores({
			from: r.collections.id.through(r.postgresstoresCollections.collectionsId),
			to: r.postgresstores.id.through(r.postgresstoresCollections.postgresstoresId)
		}),
	},
	spaces: {
		collections: r.many.collections(),
		federatedSpaces: r.many.federatedSpaces(),
		integrations: r.many.integrations(),
		moments: r.many.moments(),
		polls: r.many.polls(),
		products: r.many.products(),
		reactions: r.many.reactions(),
		reports: r.many.report(),
		shorts: r.many.shorts(),
		showcases: r.many.showcases(),
		directusFileCoverImage: r.one.directusFiles({
			from: r.spaces.coverImage,
			to: r.directusFiles.id,
			alias: "spaces_coverImage_directusFiles_id"
		}),
		directusFileImage: r.one.directusFiles({
			from: r.spaces.image,
			to: r.directusFiles.id,
			alias: "spaces_image_directusFiles_id"
		}),
		directusUserOwner: r.one.directusUsers({
			from: r.spaces.owner,
			to: r.directusUsers.id,
			alias: "spaces_owner_directusUsers_id"
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.spaces.userCreated,
			to: r.directusUsers.id,
			alias: "spaces_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.spaces.userUpdated,
			to: r.directusUsers.id,
			alias: "spaces_userUpdated_directusUsers_id"
		}),
		articles: r.many.articles(),
		cities: r.many.cities(),
		countries: r.many.countries(),
		departments: r.many.departments(),
		directusUsers: r.many.directusUsers({
			alias: "directusUsers_id_spaces_id_via_spacesDirectusUsers"
		}),
		directusFiles: r.many.directusFiles({
			alias: "directusFiles_id_spaces_id_via_spacesFiles"
		}),
		lists: r.many.lists(),
		spacesLiveRooms: r.many.spacesLiveRooms(),
		pages: r.many.pages(),
		posts: r.many.posts(),
		shopTypes: r.many.shopType(),
		spaceTypes: r.many.spaceTypes(),
		states: r.many.states({
			from: r.spaces.id.through(r.spacesStates.spacesId),
			to: r.states.id.through(r.spacesStates.statesId)
		}),
		tags: r.many.tags({
			from: r.spaces.id.through(r.spacesTags.spacesId),
			to: r.tags.id.through(r.spacesTags.tagsId)
		}),
		templates: r.many.templates({
			from: r.spaces.id.through(r.spacesTemplates.spacesId),
			to: r.templates.id.through(r.spacesTemplates.templatesId)
		}),
	},
	commentsDirectusUsers: {
		comment: r.one.comments({
			from: r.commentsDirectusUsers.commentId,
			to: r.comments.id
		}),
	},
	reactions: {
		commentsViaCommentsReactions: r.many.comments({
			alias: "comments_id_reactions_id_via_commentsReactions"
		}),
		directusFile: r.one.directusFiles({
			from: r.reactions.image,
			to: r.directusFiles.id
		}),
		list: r.one.lists({
			from: r.reactions.listId,
			to: r.lists.id,
			alias: "reactions_listId_lists_id"
		}),
		post: r.one.posts({
			from: r.reactions.posts,
			to: r.posts.id,
			alias: "reactions_posts_posts_id"
		}),
		productRelation: r.one.products({
			from: r.reactions.product,
			to: r.products.id
		}),
		space: r.one.spaces({
			from: r.reactions.spaceId,
			to: r.spaces.id
		}),
		directusUserUser: r.one.directusUsers({
			from: r.reactions.user,
			to: r.directusUsers.id,
			alias: "reactions_user_directusUsers_id"
		}),
		directusUserUserId: r.one.directusUsers({
			from: r.reactions.userId,
			to: r.directusUsers.id,
			alias: "reactions_userId_directusUsers_id"
		}),
		video: r.one.videos({
			from: r.reactions.videoId,
			to: r.videos.id
		}),
		commentsViaReactionsComments: r.many.comments({
			alias: "comments_id_reactions_id_via_reactionsComments"
		}),
		reactionsDirectusUsers: r.many.reactionsDirectusUsers(),
		lists: r.many.lists({
			alias: "lists_id_reactions_id_via_reactionsLists"
		}),
		posts: r.many.posts({
			alias: "posts_id_reactions_id_via_reactionsPosts"
		}),
		shorts: r.many.shorts({
			from: r.reactions.id.through(r.reactionsShorts.reactionsId),
			to: r.shorts.id.through(r.reactionsShorts.shortsId)
		}),
	},
	connectionsDirectusUsers: {
		connection: r.one.connections({
			from: r.connectionsDirectusUsers.connectionsId,
			to: r.connections.id
		}),
	},
	connections: {
		connectionsDirectusUsers: r.many.connectionsDirectusUsers(),
	},
	contacts: {
		directusUserUserCreated: r.one.directusUsers({
			from: r.contacts.userCreated,
			to: r.directusUsers.id,
			alias: "contacts_userCreated_directusUsers_id"
		}),
		directusUserUser: r.one.directusUsers({
			from: r.contacts.user,
			to: r.directusUsers.id,
			alias: "contacts_user_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.contacts.userUpdated,
			to: r.directusUsers.id,
			alias: "contacts_userUpdated_directusUsers_id"
		}),
		organizations: r.many.organizations({
			from: r.contacts.id.through(r.organizationsContacts.contactsId),
			to: r.organizations.id.through(r.organizationsContacts.organizationsId)
		}),
		osActivities: r.many.osActivities({
			from: r.contacts.id.through(r.osActivityContacts.contactsId),
			to: r.osActivities.id.through(r.osActivityContacts.osActivitiesId)
		}),
		osDeals: r.many.osDeals({
			from: r.contacts.id.through(r.osDealContacts.contactsId),
			to: r.osDeals.id.through(r.osDealContacts.osDealsId)
		}),
		osInvoices: r.many.osInvoices(),
		osPayments: r.many.osPayments(),
		osProjects: r.many.osProjects({
			from: r.contacts.id.through(r.osProjectContacts.contactsId),
			to: r.osProjects.id.through(r.osProjectContacts.osProjectsId)
		}),
		osProposalApprovals: r.many.osProposalApprovals(),
		osProposals: r.many.osProposals({
			from: r.contacts.id.through(r.osProposalContacts.contactsId),
			to: r.osProposals.id.through(r.osProposalContacts.osProposalsId)
		}),
	},
	conversations: {
		organizationRelation: r.one.organizations({
			from: r.conversations.organization,
			to: r.organizations.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.conversations.userCreated,
			to: r.directusUsers.id,
			alias: "conversations_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.conversations.userUpdated,
			to: r.directusUsers.id,
			alias: "conversations_userUpdated_directusUsers_id"
		}),
		messages: r.many.messages(),
	},
	organizations: {
		conversations: r.many.conversations(),
		organizationAddresses: r.many.organizationAddresses(),
		directusFolder: r.one.directusFolders({
			from: r.organizations.folder,
			to: r.directusFolders.id
		}),
		directusFile: r.one.directusFiles({
			from: r.organizations.logo,
			to: r.directusFiles.id
		}),
		directusUserOwner: r.one.directusUsers({
			from: r.organizations.owner,
			to: r.directusUsers.id,
			alias: "organizations_owner_directusUsers_id"
		}),
		osPaymentTerm: r.one.osPaymentTerms({
			from: r.organizations.paymentTerms,
			to: r.osPaymentTerms.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.organizations.userCreated,
			to: r.directusUsers.id,
			alias: "organizations_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.organizations.userUpdated,
			to: r.directusUsers.id,
			alias: "organizations_userUpdated_directusUsers_id"
		}),
		contacts: r.many.contacts(),
		osActivities: r.many.osActivities(),
		osDeals: r.many.osDeals(),
		osInvoices: r.many.osInvoices(),
		osPayments: r.many.osPayments(),
		osProjects: r.many.osProjects(),
		osProposals: r.many.osProposals(),
	},
	currency: {
		countries: r.many.countries(),
		departments: r.many.departments({
			from: r.currency.id.through(r.currencyDepartments.currencyId),
			to: r.departments.id.through(r.currencyDepartments.departmentsId)
		}),
		financeIndices: r.many.financeIndex({
			from: r.currency.id.through(r.financeIndexCurrency.currencyId),
			to: r.financeIndex.id.through(r.financeIndexCurrency.financeIndexId)
		}),
		incentives: r.many.incentives({
			from: r.currency.id.through(r.incentivesCurrency.currencyId),
			to: r.incentives.id.through(r.incentivesCurrency.incentivesId)
		}),
		payments: r.many.payments({
			from: r.currency.id.through(r.paymentsCurrency.currencyId),
			to: r.payments.id.through(r.paymentsCurrency.paymentsId)
		}),
		products: r.many.products({
			from: r.currency.id.through(r.productsCurrency.currencyId),
			to: r.products.id.through(r.productsCurrency.productsId)
		}),
		transactions: r.many.transactions({
			from: r.currency.id.through(r.transactionsCurrency.currencyId),
			to: r.transactions.id.through(r.transactionsCurrency.transactionsId)
		}),
	},
	timezones: {
		countries: r.many.countries(),
	},
	couponsProducts: {
		product: r.one.products({
			from: r.couponsProducts.productsId,
			to: r.products.id
		}),
	},
	crossSellProducts: {
		directusUser: r.one.directusUsers({
			from: r.crossSellProducts.user,
			to: r.directusUsers.id
		}),
		products: r.many.products({
			from: r.crossSellProducts.id.through(r.crossSellProductsProducts.crossSellProductsId),
			to: r.products.id.through(r.crossSellProductsProducts.productsId)
		}),
	},
	showcases: {
		departments: r.many.departments(),
		shopsViaShopsShowcases: r.many.shops({
			alias: "shops_id_showcases_id_via_shopsShowcases"
		}),
		directusUser: r.one.directusUsers({
			from: r.showcases.owner,
			to: r.directusUsers.id
		}),
		products: r.many.products(),
		shopsViaShowcasesShops: r.many.shops({
			alias: "shops_id_showcases_id_via_showcasesShops"
		}),
		spaces: r.many.spaces({
			from: r.showcases.id.through(r.showcasesSpaces.showcasesId),
			to: r.spaces.id.through(r.showcasesSpaces.spacesId)
		}),
	},
	directusAccess: {
		directusPolicy: r.one.directusPolicies({
			from: r.directusAccess.policy,
			to: r.directusPolicies.id
		}),
		directusRole: r.one.directusRoles({
			from: r.directusAccess.role,
			to: r.directusRoles.id
		}),
		directusUser: r.one.directusUsers({
			from: r.directusAccess.user,
			to: r.directusUsers.id
		}),
	},
	directusPolicies: {
		directusAccesses: r.many.directusAccess(),
		directusPermissions: r.many.directusPermissions(),
	},
	directusRoles: {
		directusAccesses: r.many.directusAccess(),
		directusUsersViaDirectusPresets: r.many.directusUsers({
			from: r.directusRoles.id.through(r.directusPresets.role),
			to: r.directusUsers.id.through(r.directusPresets.user),
			alias: "directusRoles_id_directusUsers_id_via_directusPresets"
		}),
		directusRole: r.one.directusRoles({
			from: r.directusRoles.parent,
			to: r.directusRoles.id,
			alias: "directusRoles_parent_directusRoles_id"
		}),
		directusRoles: r.many.directusRoles({
			alias: "directusRoles_parent_directusRoles_id"
		}),
		directusSettings: r.many.directusSettings(),
		directusShares: r.many.directusShares(),
		directusUsersRole: r.many.directusUsers({
			alias: "directusUsers_role_directusRoles_id"
		}),
		profiles: r.many.profiles(),
	},
	directusCollections: {
		directusCollection: r.one.directusCollections({
			from: r.directusCollections.group,
			to: r.directusCollections.collection,
			alias: "directusCollections_group_directusCollections_collection"
		}),
		directusCollections: r.many.directusCollections({
			alias: "directusCollections_group_directusCollections_collection"
		}),
		directusShares: r.many.directusShares(),
		directusVersions: r.many.directusVersions(),
	},
	directusDashboards: {
		directusUser: r.one.directusUsers({
			from: r.directusDashboards.userCreated,
			to: r.directusUsers.id,
			alias: "directusDashboards_userCreated_directusUsers_id"
		}),
		directusUsers: r.many.directusUsers({
			from: r.directusDashboards.id.through(r.directusPanels.dashboard),
			to: r.directusUsers.id.through(r.directusPanels.userCreated),
			alias: "directusDashboards_id_directusUsers_id_via_directusPanels"
		}),
	},
	directusDeployments: {
		directusUsers: r.many.directusUsers({
			from: r.directusDeployments.id.through(r.directusDeploymentProjects.deployment),
			to: r.directusUsers.id.through(r.directusDeploymentProjects.userCreated),
			alias: "directusDeployments_id_directusUsers_id_via_directusDeploymentProjects"
		}),
		directusUser: r.one.directusUsers({
			from: r.directusDeployments.userCreated,
			to: r.directusUsers.id,
			alias: "directusDeployments_userCreated_directusUsers_id"
		}),
	},
	directusDeploymentProjects: {
		directusUsers: r.many.directusUsers({
			from: r.directusDeploymentProjects.id.through(r.directusDeploymentRuns.project),
			to: r.directusUsers.id.through(r.directusDeploymentRuns.userCreated)
		}),
	},
	directusFolders: {
		directusFiles: r.many.directusFiles(),
		directusFolder: r.one.directusFolders({
			from: r.directusFolders.parent,
			to: r.directusFolders.id,
			alias: "directusFolders_parent_directusFolders_id"
		}),
		directusFolders: r.many.directusFolders({
			alias: "directusFolders_parent_directusFolders_id"
		}),
		directusSettings: r.many.directusSettings(),
		organizations: r.many.organizations(),
		osSettings: r.many.osSettings(),
	},
	directusFlows: {
		directusUser: r.one.directusUsers({
			from: r.directusFlows.userCreated,
			to: r.directusUsers.id
		}),
		directusOperations: r.many.directusOperations(),
	},
	directusOauthClients: {
		directusUsersViaDirectusOauthCodes: r.many.directusUsers({
			from: r.directusOauthClients.clientId.through(r.directusOauthCodes.client),
			to: r.directusUsers.id.through(r.directusOauthCodes.user),
			alias: "directusOauthClients_clientId_directusUsers_id_via_directusOauthCodes"
		}),
		directusUsersViaDirectusOauthConsents: r.many.directusUsers({
			from: r.directusOauthClients.clientId.through(r.directusOauthConsents.client),
			to: r.directusUsers.id.through(r.directusOauthConsents.user),
			alias: "directusOauthClients_clientId_directusUsers_id_via_directusOauthConsents"
		}),
		directusUsersViaDirectusOauthTokens: r.many.directusUsers({
			from: r.directusOauthClients.clientId.through(r.directusOauthTokens.client),
			to: r.directusUsers.id.through(r.directusOauthTokens.user),
			alias: "directusOauthClients_clientId_directusUsers_id_via_directusOauthTokens"
		}),
		directusSessions: r.many.directusSessions(),
	},
	directusOperations: {
		directusFlow: r.one.directusFlows({
			from: r.directusOperations.flow,
			to: r.directusFlows.id
		}),
		directusOperationReject: r.one.directusOperations({
			from: r.directusOperations.reject,
			to: r.directusOperations.id,
			alias: "directusOperations_reject_directusOperations_id"
		}),
		directusOperationsReject: r.one.directusOperations({
			alias: "directusOperations_reject_directusOperations_id"
		}),
		directusOperationResolve: r.one.directusOperations({
			from: r.directusOperations.resolve,
			to: r.directusOperations.id,
			alias: "directusOperations_resolve_directusOperations_id"
		}),
		directusOperationsResolve: r.one.directusOperations({
			alias: "directusOperations_resolve_directusOperations_id"
		}),
		directusUser: r.one.directusUsers({
			from: r.directusOperations.userCreated,
			to: r.directusUsers.id
		}),
	},
	directusPermissions: {
		directusPolicy: r.one.directusPolicies({
			from: r.directusPermissions.policy,
			to: r.directusPolicies.id
		}),
	},
	directusRevisions: {
		directusActivity: r.one.directusActivity({
			from: r.directusRevisions.activity,
			to: r.directusActivity.id
		}),
		directusRevision: r.one.directusRevisions({
			from: r.directusRevisions.parent,
			to: r.directusRevisions.id,
			alias: "directusRevisions_parent_directusRevisions_id"
		}),
		directusRevisions: r.many.directusRevisions({
			alias: "directusRevisions_parent_directusRevisions_id"
		}),
		directusVersion: r.one.directusVersions({
			from: r.directusRevisions.version,
			to: r.directusVersions.id
		}),
	},
	directusActivity: {
		directusRevisions: r.many.directusRevisions(),
	},
	directusVersions: {
		directusRevisions: r.many.directusRevisions(),
		directusCollection: r.one.directusCollections({
			from: r.directusVersions.collection,
			to: r.directusCollections.collection
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.directusVersions.userCreated,
			to: r.directusUsers.id,
			alias: "directusVersions_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.directusVersions.userUpdated,
			to: r.directusUsers.id,
			alias: "directusVersions_userUpdated_directusUsers_id"
		}),
	},
	directusSessions: {
		directusOauthClient: r.one.directusOauthClients({
			from: r.directusSessions.oauthClient,
			to: r.directusOauthClients.clientId
		}),
		directusShare: r.one.directusShares({
			from: r.directusSessions.share,
			to: r.directusShares.id
		}),
		directusUser: r.one.directusUsers({
			from: r.directusSessions.user,
			to: r.directusUsers.id
		}),
	},
	directusShares: {
		directusSessions: r.many.directusSessions(),
		directusCollection: r.one.directusCollections({
			from: r.directusShares.collection,
			to: r.directusCollections.collection
		}),
		directusRole: r.one.directusRoles({
			from: r.directusShares.role,
			to: r.directusRoles.id
		}),
		directusUser: r.one.directusUsers({
			from: r.directusShares.userCreated,
			to: r.directusUsers.id
		}),
	},
	directusSettings: {
		directusFileProjectLogo: r.one.directusFiles({
			from: r.directusSettings.projectLogo,
			to: r.directusFiles.id,
			alias: "directusSettings_projectLogo_directusFiles_id"
		}),
		directusFilePublicBackground: r.one.directusFiles({
			from: r.directusSettings.publicBackground,
			to: r.directusFiles.id,
			alias: "directusSettings_publicBackground_directusFiles_id"
		}),
		directusFilePublicFavicon: r.one.directusFiles({
			from: r.directusSettings.publicFavicon,
			to: r.directusFiles.id,
			alias: "directusSettings_publicFavicon_directusFiles_id"
		}),
		directusFilePublicForeground: r.one.directusFiles({
			from: r.directusSettings.publicForeground,
			to: r.directusFiles.id,
			alias: "directusSettings_publicForeground_directusFiles_id"
		}),
		directusRole: r.one.directusRoles({
			from: r.directusSettings.publicRegistrationRole,
			to: r.directusRoles.id
		}),
		directusFolder: r.one.directusFolders({
			from: r.directusSettings.storageDefaultFolder,
			to: r.directusFolders.id
		}),
	},
	emojiReactions: {
		usersInAuth: r.one.usersInAuth({
			from: r.emojiReactions.userId,
			to: r.usersInAuth.id
		}),
	},
	eventsCoupons: {
		event: r.one.events({
			from: r.eventsCoupons.eventsId,
			to: r.events.id
		}),
	},
	invoices: {
		events: r.many.events(),
		addresses: r.many.address(),
		orders: r.many.orders({
			from: r.invoices.id.through(r.invoicesOrders.invoiceId),
			to: r.orders.id.through(r.invoicesOrders.orderId)
		}),
		shippingAddresses: r.many.shippingAddress({
			from: r.invoices.id.through(r.invoicesShippingAddress.invoiceId),
			to: r.shippingAddress.id.through(r.invoicesShippingAddress.shippingAddressId)
		}),
	},
	states: {
		events: r.many.events(),
		geoRegions: r.many.geoRegions(),
		profiles: r.many.profiles(),
		shippingAddresses: r.many.shippingAddresses(),
		spaces: r.many.spaces(),
		cities: r.many.cities(),
		taxes: r.many.taxes({
			from: r.states.id.through(r.taxesStates.statesId),
			to: r.taxes.id.through(r.taxesStates.taxesId)
		}),
	},
	faqs: {
		directusUsers: r.many.directusUsers(),
		faqsFiles: r.many.faqsFiles(),
		products: r.many.products({
			from: r.faqs.id.through(r.faqsProducts.faqsId),
			to: r.products.id.through(r.faqsProducts.productsId)
		}),
		reports: r.many.report({
			from: r.faqs.id.through(r.reportFaqs.faqsId),
			to: r.report.id.through(r.reportFaqs.reportId)
		}),
	},
	faqsFiles: {
		faq: r.one.faqs({
			from: r.faqsFiles.faqsId,
			to: r.faqs.id
		}),
	},
	federatedSpaces: {
		spaces: r.many.spaces({
			from: r.federatedSpaces.id.through(r.federatedSpacesSpaces.federatedSpacesId),
			to: r.spaces.id.through(r.federatedSpacesSpaces.spacesId)
		}),
	},
	feeds: {
		shopRelation: r.one.shops({
			from: r.feeds.shop,
			to: r.shops.id
		}),
		posts: r.many.posts({
			from: r.feeds.id.through(r.feedsPosts.feedId),
			to: r.posts.id.through(r.feedsPosts.postId)
		}),
	},
	shops: {
		feeds: r.many.feeds(),
		shopTypes: r.many.shopType(),
		shopsAgreements: r.many.shopsAgreements(),
		categories: r.many.categories(),
		comments: r.many.comments(),
		countries: r.many.countries(),
		departments: r.many.departments(),
		shopsDirectusUsers: r.many.shopsDirectusUsers(),
		shopsFiles: r.many.shopsFiles(),
		products: r.many.products(),
		showcasesViaShopsShowcases: r.many.showcases({
			from: r.shops.id.through(r.shopsShowcases.shopsId),
			to: r.showcases.id.through(r.shopsShowcases.showcasesId),
			alias: "shops_id_showcases_id_via_shopsShowcases"
		}),
		showcasesViaShowcasesShops: r.many.showcases({
			from: r.shops.id.through(r.showcasesShops.shopsId),
			to: r.showcases.id.through(r.showcasesShops.showcasesId),
			alias: "shops_id_showcases_id_via_showcasesShops"
		}),
	},
	financeIndex: {
		articles: r.many.articles(),
		currencies: r.many.currency(),
		regions: r.many.region({
			from: r.financeIndex.id.through(r.financeIndexRegion.financeIndexId),
			to: r.region.id.through(r.financeIndexRegion.regionId)
		}),
	},
	region: {
		financeIndices: r.many.financeIndex(),
		projects: r.many.projects(),
		addresses: r.many.address(),
		countries: r.many.countries(),
		shippingAddresses: r.many.shippingAddress({
			from: r.region.id.through(r.regionShippingAddress.regionId),
			to: r.shippingAddress.id.through(r.regionShippingAddress.shippingAddressId)
		}),
	},
	friendRequests: {
		addresses: r.many.address(),
		profiles: r.many.profiles({
			from: r.friendRequests.id.through(r.friendRequestsProfiles.friendRequestsId),
			to: r.profiles.id.through(r.friendRequestsProfiles.profilesId)
		}),
	},
	profiles: {
		friendRequests: r.many.friendRequests(),
		friendSuggestions: r.many.friendSuggestions(),
		media: r.many.media(),
		directusFile: r.one.directusFiles({
			from: r.profiles.avatar,
			to: r.directusFiles.id
		}),
		usersInAuth: r.one.usersInAuth({
			from: r.profiles.id,
			to: r.usersInAuth.id
		}),
		directusRole: r.one.directusRoles({
			from: r.profiles.role,
			to: r.directusRoles.id
		}),
		directusUser: r.one.directusUsers({
			from: r.profiles.user,
			to: r.directusUsers.id
		}),
		cities: r.many.cities(),
		countries: r.many.countries(),
		followers: r.many.followers(),
		states: r.many.states({
			from: r.profiles.id.through(r.profilesStates.profilesId),
			to: r.states.id.through(r.profilesStates.statesId)
		}),
	},
	friendSuggestions: {
		profiles: r.many.profiles({
			from: r.friendSuggestions.id.through(r.friendSuggestionsProfiles.friendSuggestionsId),
			to: r.profiles.id.through(r.friendSuggestionsProfiles.profilesId)
		}),
	},
	gamification: {
		directusUserAnniversaries: r.one.directusUsers({
			from: r.gamification.anniversaries,
			to: r.directusUsers.id,
			alias: "gamification_anniversaries_directusUsers_id"
		}),
		directusUserBirthdays: r.one.directusUsers({
			from: r.gamification.birthdays,
			to: r.directusUsers.id,
			alias: "gamification_birthdays_directusUsers_id"
		}),
		directusUserLeaderboards: r.one.directusUsers({
			from: r.gamification.leaderboards,
			to: r.directusUsers.id,
			alias: "gamification_leaderboards_directusUsers_id"
		}),
		directusUserNominationUser: r.one.directusUsers({
			from: r.gamification.nominationUser,
			to: r.directusUsers.id,
			alias: "gamification_nominationUser_directusUsers_id"
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.gamification.userCreated,
			to: r.directusUsers.id,
			alias: "gamification_userCreated_directusUsers_id"
		}),
		userProfileRelation: r.one.userProfile({
			from: r.gamification.userProfile,
			to: r.userProfile.id
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.gamification.userUpdated,
			to: r.directusUsers.id,
			alias: "gamification_userUpdated_directusUsers_id"
		}),
		directusUsers: r.many.directusUsers({
			alias: "directusUsers_id_gamification_id_via_gamificationDirectusUsers"
		}),
		events: r.many.events(),
		notifications: r.many.notifications({
			from: r.gamification.id.through(r.gamificationNotifications.gamificationId),
			to: r.notifications.id.through(r.gamificationNotifications.notificationsId)
		}),
		products: r.many.products({
			from: r.gamification.id.through(r.gamificationProducts.gamificationId),
			to: r.products.id.through(r.gamificationProducts.productsId)
		}),
		videos: r.many.videos({
			from: r.gamification.id.through(r.gamificationVideos.gamificationId),
			to: r.videos.id.through(r.gamificationVideos.videosId)
		}),
	},
	userProfile: {
		gamifications: r.many.gamification(),
		directusFile: r.one.directusFiles({
			from: r.userProfile.avatar,
			to: r.directusFiles.id
		}),
		directusUserUser: r.one.directusUsers({
			from: r.userProfile.user,
			to: r.directusUsers.id,
			alias: "userProfile_user_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.userProfile.userUpdated,
			to: r.directusUsers.id,
			alias: "userProfile_userUpdated_directusUsers_id"
		}),
	},
	notifications: {
		gamifications: r.many.gamification(),
		directusUser: r.one.directusUsers({
			from: r.notifications.recipient,
			to: r.directusUsers.id
		}),
	},
	videos: {
		gamifications: r.many.gamification(),
		reactions: r.many.reactions(),
		seasonsName: r.many.seasons({
			alias: "seasons_name_videos_id"
		}),
		seasonsViaSeasonsVideos: r.many.seasons({
			alias: "seasons_id_videos_id_via_seasonsVideos"
		}),
		streams: r.many.streams(),
		attribute: r.one.attributes({
			from: r.videos.distributor,
			to: r.attributes.id
		}),
		directusFileMedia: r.one.directusFiles({
			from: r.videos.media,
			to: r.directusFiles.id,
			alias: "videos_media_directusFiles_id"
		}),
		rating: r.one.ratings({
			from: r.videos.ratings,
			to: r.ratings.id
		}),
		directusFileThumbnail: r.one.directusFiles({
			from: r.videos.thumbnail,
			to: r.directusFiles.id,
			alias: "videos_thumbnail_directusFiles_id"
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.videos.userCreated,
			to: r.directusUsers.id,
			alias: "videos_userCreated_directusUsers_id"
		}),
		directusUserUser: r.one.directusUsers({
			from: r.videos.user,
			to: r.directusUsers.id,
			alias: "videos_user_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.videos.userUpdated,
			to: r.directusUsers.id,
			alias: "videos_userUpdated_directusUsers_id"
		}),
		categories: r.many.categories(),
		comments: r.many.comments(),
		departments: r.many.departments(),
		manufacturers: r.many.manufacturer(),
		productTypes: r.many.productTypes(),
		products: r.many.products(),
		tags: r.many.tags(),
	},
	geoRegions: {
		cities: r.many.cities(),
		countries: r.many.countries(),
		states: r.many.states({
			from: r.geoRegions.id.through(r.geoRegionsStates.geoRegionsId),
			to: r.states.id.through(r.geoRegionsStates.statesId)
		}),
	},
	globals: {
		directusFileLogoOnDarkBg: r.one.directusFiles({
			from: r.globals.logoOnDarkBg,
			to: r.directusFiles.id,
			alias: "globals_logoOnDarkBg_directusFiles_id"
		}),
		directusFileLogoOnLightBg: r.one.directusFiles({
			from: r.globals.logoOnLightBg,
			to: r.directusFiles.id,
			alias: "globals_logoOnLightBg_directusFiles_id"
		}),
		directusFileOgImage: r.one.directusFiles({
			from: r.globals.ogImage,
			to: r.directusFiles.id,
			alias: "globals_ogImage_directusFiles_id"
		}),
	},
	helpArticles: {
		helpCollectionRelation: r.one.helpCollections({
			from: r.helpArticles.helpCollection,
			to: r.helpCollections.id
		}),
		directusUserOwner: r.one.directusUsers({
			from: r.helpArticles.owner,
			to: r.directusUsers.id,
			alias: "helpArticles_owner_directusUsers_id"
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.helpArticles.userCreated,
			to: r.directusUsers.id,
			alias: "helpArticles_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.helpArticles.userUpdated,
			to: r.directusUsers.id,
			alias: "helpArticles_userUpdated_directusUsers_id"
		}),
	},
	helpCollections: {
		helpArticles: r.many.helpArticles(),
	},
	inbox: {
		formRelation: r.one.forms({
			from: r.inbox.form,
			to: r.forms.id
		}),
		osProject: r.one.osProjects({
			from: r.inbox.project,
			to: r.osProjects.id
		}),
		osTask: r.one.osTasks({
			from: r.inbox.task,
			to: r.osTasks.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.inbox.userCreated,
			to: r.directusUsers.id,
			alias: "inbox_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.inbox.userUpdated,
			to: r.directusUsers.id,
			alias: "inbox_userUpdated_directusUsers_id"
		}),
	},
	osProjects: {
		inboxes: r.many.inbox(),
		osExpenses: r.many.osExpenses(),
		osInvoices: r.many.osInvoices(),
		contacts: r.many.contacts(),
		osProjectUpdates: r.many.osProjectUpdates(),
		organizationRelation: r.one.organizations({
			from: r.osProjects.organization,
			to: r.organizations.id
		}),
		directusUserOwner: r.one.directusUsers({
			from: r.osProjects.owner,
			to: r.directusUsers.id,
			alias: "osProjects_owner_directusUsers_id"
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osProjects.userCreated,
			to: r.directusUsers.id,
			alias: "osProjects_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osProjects.userUpdated,
			to: r.directusUsers.id,
			alias: "osProjects_userUpdated_directusUsers_id"
		}),
		osTasks: r.many.osTasks(),
	},
	osTasks: {
		inboxes: r.many.inbox(),
		directusFiles: r.many.directusFiles(),
		directusUserAssignedTo: r.one.directusUsers({
			from: r.osTasks.assignedTo,
			to: r.directusUsers.id,
			alias: "osTasks_assignedTo_directusUsers_id"
		}),
		formRelation: r.one.forms({
			from: r.osTasks.form,
			to: r.forms.id
		}),
		osProject: r.one.osProjects({
			from: r.osTasks.project,
			to: r.osProjects.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osTasks.userCreated,
			to: r.directusUsers.id,
			alias: "osTasks_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osTasks.userUpdated,
			to: r.directusUsers.id,
			alias: "osTasks_userUpdated_directusUsers_id"
		}),
	},
	incentives: {
		directusUser: r.one.directusUsers({
			from: r.incentives.userId,
			to: r.directusUsers.id
		}),
		currencies: r.many.currency(),
		orders: r.many.orders({
			from: r.incentives.id.through(r.incentivesOrders.incentivesId),
			to: r.orders.id.through(r.incentivesOrders.ordersId)
		}),
		products: r.many.products({
			from: r.incentives.id.through(r.incentivesProducts.incentivesId),
			to: r.products.id.through(r.incentivesProducts.productsId)
		}),
	},
	orders: {
		incentives: r.many.incentives(),
		invoices: r.many.invoices(),
		orderItems: r.many.orderItems(),
		directusUser: r.one.directusUsers({
			from: r.orders.userId,
			to: r.directusUsers.id
		}),
		products: r.many.products({
			from: r.orders.id.through(r.ordersProducts.ordersId),
			to: r.products.id.through(r.ordersProducts.productsId)
		}),
		payments: r.many.payments({
			from: r.orders.id.through(r.paymentsOrders.ordersId),
			to: r.payments.id.through(r.paymentsOrders.paymentsId)
		}),
		returns: r.many.returns({
			from: r.orders.id.through(r.returnsOrders.ordersId),
			to: r.returns.id.through(r.returnsOrders.returnsId)
		}),
		shipments: r.many.shipment(),
		shippingAddresses: r.many.shippingAddresses({
			from: r.orders.id.through(r.shippingAddressesOrders.ordersId),
			to: r.shippingAddresses.id.through(r.shippingAddressesOrders.shippingAddressesId)
		}),
		transactions: r.many.transactions(),
	},
	ratings: {
		integrations: r.many.integrations(),
		directusFile: r.one.directusFiles({
			from: r.ratings.image,
			to: r.directusFiles.id
		}),
		products: r.many.products(),
		streams: r.many.streams({
			from: r.ratings.id.through(r.streamsRatings.ratingsId),
			to: r.streams.id.through(r.streamsRatings.streamsId)
		}),
		videos: r.many.videos(),
	},
	report: {
		integrations: r.many.integrations(),
		comments: r.many.comments(),
		reportDirectusUsers: r.many.reportDirectusUsers(),
		faqs: r.many.faqs(),
		posts: r.many.posts(),
		products: r.many.products(),
		spaces: r.many.spaces({
			from: r.report.id.through(r.reportSpaces.reportId),
			to: r.spaces.id.through(r.reportSpaces.spacesId)
		}),
	},
	tags: {
		integrations: r.many.integrations(),
		listsTemplates: r.many.listsTemplate(),
		productsViaProductsTags: r.many.products({
			alias: "products_id_tags_id_via_productsTags"
		}),
		spaces: r.many.spaces(),
		articles: r.many.articles(),
		categories: r.many.categories(),
		departments: r.many.departments(),
		posts: r.many.posts(),
		productsViaTagsProducts: r.many.products({
			alias: "products_id_tags_id_via_tagsProducts"
		}),
		shorts: r.many.shorts(),
		videos: r.many.videos({
			from: r.tags.id.through(r.videosTags.tagsId),
			to: r.videos.id.through(r.videosTags.videosId)
		}),
	},
	shippingAddress: {
		invoices: r.many.invoices(),
		regions: r.many.region(),
	},
	listItems: {
		list: r.one.lists({
			from: r.listItems.listId,
			to: r.lists.id
		}),
		directusFile: r.one.directusFiles({
			from: r.listItems.media,
			to: r.directusFiles.id
		}),
		post: r.one.posts({
			from: r.listItems.postId,
			to: r.posts.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.listItems.userCreated,
			to: r.directusUsers.id,
			alias: "listItems_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.listItems.userUpdated,
			to: r.directusUsers.id,
			alias: "listItems_userUpdated_directusUsers_id"
		}),
		directusUsers: r.many.directusUsers({
			alias: "directusUsers_id_listItems_id_via_listItemsDirectusUsers"
		}),
		products: r.many.products({
			from: r.listItems.id.through(r.listItemsProducts.listItemsId),
			to: r.products.id.through(r.listItemsProducts.productsId)
		}),
		listsTemplates: r.many.listsTemplate({
			from: r.listItems.id.through(r.listsTemplateListItems.listItemsId),
			to: r.listsTemplate.id.through(r.listsTemplateListItems.listsTemplateId)
		}),
	},
	listProducts: {
		lists: r.many.lists({
			from: r.listProducts.id.through(r.listProductsLists.listProductsId),
			to: r.lists.id.through(r.listProductsLists.listsId)
		}),
	},
	listsDirectusUsers: {
		list: r.one.lists({
			from: r.listsDirectusUsers.listId,
			to: r.lists.id
		}),
	},
	listsTemplate: {
		directusUsers: r.many.directusUsers(),
		listItems: r.many.listItems(),
		tags: r.many.tags({
			from: r.listsTemplate.id.through(r.listsTemplateTags.listsTemplateId),
			to: r.tags.id.through(r.listsTemplateTags.tagsId)
		}),
	},
	templates: {
		lists: r.many.lists(),
		spaces: r.many.spaces(),
		spaceTypes: r.many.spaceTypes(),
	},
	listsType: {
		categories: r.many.categories(),
		lists: r.many.lists(),
	},
	media: {
		profile: r.one.profiles({
			from: r.media.profileId,
			to: r.profiles.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.media.userCreated,
			to: r.directusUsers.id,
			alias: "media_userCreated_directusUsers_id"
		}),
		directusUserUser: r.one.directusUsers({
			from: r.media.user,
			to: r.directusUsers.id,
			alias: "media_user_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.media.userUpdated,
			to: r.directusUsers.id,
			alias: "media_userUpdated_directusUsers_id"
		}),
		directusFiles: r.many.directusFiles(),
		mediaFolders: r.many.mediaFolders(),
	},
	mediaFolders: {
		media: r.one.media({
			from: r.mediaFolders.parentFolder,
			to: r.media.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.mediaFolders.userCreated,
			to: r.directusUsers.id,
			alias: "mediaFolders_userCreated_directusUsers_id"
		}),
		directusUserUser: r.one.directusUsers({
			from: r.mediaFolders.user,
			to: r.directusUsers.id,
			alias: "mediaFolders_user_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.mediaFolders.userUpdated,
			to: r.directusUsers.id,
			alias: "mediaFolders_userUpdated_directusUsers_id"
		}),
		directusUsers: r.many.directusUsers({
			alias: "directusUsers_id_mediaFolders_id_via_mediaFoldersDirectusUsers"
		}),
	},
	memberGroupsEvents: {
		event: r.one.events({
			from: r.memberGroupsEvents.eventsId,
			to: r.events.id
		}),
	},
	memberGroupsPolls: {
		poll: r.one.polls({
			from: r.memberGroupsPolls.pollsId,
			to: r.polls.id
		}),
	},
	polls: {
		memberGroupsPolls: r.many.memberGroupsPolls(),
		directusUserAuthor: r.one.directusUsers({
			from: r.polls.author,
			to: r.directusUsers.id,
			alias: "polls_author_directusUsers_id"
		}),
		directusFile: r.one.directusFiles({
			from: r.polls.image,
			to: r.directusFiles.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.polls.userCreated,
			to: r.directusUsers.id,
			alias: "polls_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.polls.userUpdated,
			to: r.directusUsers.id,
			alias: "polls_userUpdated_directusUsers_id"
		}),
		spaces: r.many.spaces({
			from: r.polls.id.through(r.pollsSpaces.pollsId),
			to: r.spaces.id.through(r.pollsSpaces.spacesId)
		}),
		posts: r.many.posts({
			from: r.polls.id.through(r.postsPolls.pollsId),
			to: r.posts.id.through(r.postsPolls.postsId)
		}),
	},
	memberGroupsPosts: {
		post: r.one.posts({
			from: r.memberGroupsPosts.postsId,
			to: r.posts.id
		}),
	},
	memberGroupsProducts: {
		product: r.one.products({
			from: r.memberGroupsProducts.productsId,
			to: r.products.id
		}),
	},
	messages: {
		conversationRelation: r.one.conversations({
			from: r.messages.conversation,
			to: r.conversations.id
		}),
	},
	moments: {
		products: r.many.products({
			from: r.moments.id.through(r.momentsProducts.momentsId),
			to: r.products.id.through(r.momentsProducts.productsId)
		}),
		spaces: r.many.spaces({
			from: r.moments.id.through(r.momentsSpaces.momentsId),
			to: r.spaces.id.through(r.momentsSpaces.spacesId)
		}),
	},
	musicchartDepartments: {
		department: r.one.departments({
			from: r.musicchartDepartments.departmentsId,
			to: r.departments.id
		}),
	},
	navigation: {
		pages: r.many.pages({
			from: r.navigation.id.through(r.navigationPages.navigationId),
			to: r.pages.id.through(r.navigationPages.pagesId)
		}),
		websites: r.many.websites({
			from: r.navigation.id.through(r.navigationWebsites.navigationId),
			to: r.websites.id.through(r.navigationWebsites.websitesId)
		}),
		platforms: r.many.platform({
			from: r.navigation.id.through(r.platformNavigation.navigationId),
			to: r.platform.id.through(r.platformNavigation.platformId)
		}),
	},
	websites: {
		navigations: r.many.navigation(),
		postgresstores: r.many.postgresstores(),
		products: r.many.products(),
		directusUser: r.one.directusUsers({
			from: r.websites.creator,
			to: r.directusUsers.id
		}),
	},
	orderItems: {
		orders: r.many.orders({
			from: r.orderItems.id.through(r.orderItemsOrders.orderItemsId),
			to: r.orders.id.through(r.orderItemsOrders.ordersId)
		}),
		products: r.many.products({
			from: r.orderItems.id.through(r.orderItemsProducts.orderItemsId),
			to: r.products.id.through(r.orderItemsProducts.productsId)
		}),
	},
	organizationAddresses: {
		organizationRelation: r.one.organizations({
			from: r.organizationAddresses.organization,
			to: r.organizations.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.organizationAddresses.userCreated,
			to: r.directusUsers.id,
			alias: "organizationAddresses_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.organizationAddresses.userUpdated,
			to: r.directusUsers.id,
			alias: "organizationAddresses_userUpdated_directusUsers_id"
		}),
	},
	osPaymentTerms: {
		organizations: r.many.organizations(),
	},
	osActivities: {
		directusUserAssignedTo: r.one.directusUsers({
			from: r.osActivities.assignedTo,
			to: r.directusUsers.id,
			alias: "osActivities_assignedTo_directusUsers_id"
		}),
		osDeal: r.one.osDeals({
			from: r.osActivities.deal,
			to: r.osDeals.id
		}),
		organizationRelation: r.one.organizations({
			from: r.osActivities.organization,
			to: r.organizations.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osActivities.userCreated,
			to: r.directusUsers.id,
			alias: "osActivities_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osActivities.userUpdated,
			to: r.directusUsers.id,
			alias: "osActivities_userUpdated_directusUsers_id"
		}),
		contacts: r.many.contacts(),
	},
	osDeals: {
		osActivities: r.many.osActivities(),
		contacts: r.many.contacts(),
		osDealStage: r.one.osDealStages({
			from: r.osDeals.dealStage,
			to: r.osDealStages.id
		}),
		organizationRelation: r.one.organizations({
			from: r.osDeals.organization,
			to: r.organizations.id
		}),
		directusUserOwner: r.one.directusUsers({
			from: r.osDeals.owner,
			to: r.directusUsers.id,
			alias: "osDeals_owner_directusUsers_id"
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osDeals.userCreated,
			to: r.directusUsers.id,
			alias: "osDeals_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osDeals.userUpdated,
			to: r.directusUsers.id,
			alias: "osDeals_userUpdated_directusUsers_id"
		}),
		osProposals: r.many.osProposals(),
	},
	osDealStages: {
		osDeals: r.many.osDeals(),
	},
	osExpenses: {
		directusFile: r.one.directusFiles({
			from: r.osExpenses.file,
			to: r.directusFiles.id
		}),
		osInvoiceItem: r.one.osInvoiceItems({
			from: r.osExpenses.invoiceItem,
			to: r.osInvoiceItems.id,
			alias: "osExpenses_invoiceItem_osInvoiceItems_id"
		}),
		osProject: r.one.osProjects({
			from: r.osExpenses.project,
			to: r.osProjects.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osExpenses.userCreated,
			to: r.directusUsers.id,
			alias: "osExpenses_userCreated_directusUsers_id"
		}),
		directusUserUserSubmitted: r.one.directusUsers({
			from: r.osExpenses.userSubmitted,
			to: r.directusUsers.id,
			alias: "osExpenses_userSubmitted_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osExpenses.userUpdated,
			to: r.directusUsers.id,
			alias: "osExpenses_userUpdated_directusUsers_id"
		}),
		osInvoiceItems: r.many.osInvoiceItems({
			alias: "osInvoiceItems_billableExpense_osExpenses_id"
		}),
	},
	osInvoiceItems: {
		osExpenses: r.many.osExpenses({
			alias: "osExpenses_invoiceItem_osInvoiceItems_id"
		}),
		osExpense: r.one.osExpenses({
			from: r.osInvoiceItems.billableExpense,
			to: r.osExpenses.id,
			alias: "osInvoiceItems_billableExpense_osExpenses_id"
		}),
		osInvoice: r.one.osInvoices({
			from: r.osInvoiceItems.invoice,
			to: r.osInvoices.id
		}),
		osItem: r.one.osItems({
			from: r.osInvoiceItems.item,
			to: r.osItems.id
		}),
		osTaxRate: r.one.osTaxRates({
			from: r.osInvoiceItems.taxRate,
			to: r.osTaxRates.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osInvoiceItems.userCreated,
			to: r.directusUsers.id,
			alias: "osInvoiceItems_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osInvoiceItems.userUpdated,
			to: r.directusUsers.id,
			alias: "osInvoiceItems_userUpdated_directusUsers_id"
		}),
	},
	osInvoices: {
		osInvoiceItems: r.many.osInvoiceItems(),
		contactRelation: r.one.contacts({
			from: r.osInvoices.contact,
			to: r.contacts.id
		}),
		organizationRelation: r.one.organizations({
			from: r.osInvoices.organization,
			to: r.organizations.id
		}),
		osProject: r.one.osProjects({
			from: r.osInvoices.project,
			to: r.osProjects.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osInvoices.userCreated,
			to: r.directusUsers.id,
			alias: "osInvoices_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osInvoices.userUpdated,
			to: r.directusUsers.id,
			alias: "osInvoices_userUpdated_directusUsers_id"
		}),
		osPayments: r.many.osPayments(),
	},
	osItems: {
		osInvoiceItems: r.many.osInvoiceItems(),
		osTaxRate: r.one.osTaxRates({
			from: r.osItems.defaultTaxRate,
			to: r.osTaxRates.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osItems.userCreated,
			to: r.directusUsers.id,
			alias: "osItems_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osItems.userUpdated,
			to: r.directusUsers.id,
			alias: "osItems_userUpdated_directusUsers_id"
		}),
	},
	osTaxRates: {
		osInvoiceItems: r.many.osInvoiceItems(),
		osItems: r.many.osItems(),
	},
	osPayments: {
		contactRelation: r.one.contacts({
			from: r.osPayments.contact,
			to: r.contacts.id
		}),
		osInvoice: r.one.osInvoices({
			from: r.osPayments.invoice,
			to: r.osInvoices.id
		}),
		organizationRelation: r.one.organizations({
			from: r.osPayments.organization,
			to: r.organizations.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osPayments.userCreated,
			to: r.directusUsers.id,
			alias: "osPayments_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osPayments.userUpdated,
			to: r.directusUsers.id,
			alias: "osPayments_userUpdated_directusUsers_id"
		}),
	},
	osProjectUpdates: {
		osProject: r.one.osProjects({
			from: r.osProjectUpdates.project,
			to: r.osProjects.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osProjectUpdates.userCreated,
			to: r.directusUsers.id,
			alias: "osProjectUpdates_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osProjectUpdates.userUpdated,
			to: r.directusUsers.id,
			alias: "osProjectUpdates_userUpdated_directusUsers_id"
		}),
	},
	osProposalApprovals: {
		contactRelation: r.one.contacts({
			from: r.osProposalApprovals.contact,
			to: r.contacts.id
		}),
		osProposal: r.one.osProposals({
			from: r.osProposalApprovals.proposal,
			to: r.osProposals.id
		}),
		directusFile: r.one.directusFiles({
			from: r.osProposalApprovals.signatureImage,
			to: r.directusFiles.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osProposalApprovals.userCreated,
			to: r.directusUsers.id,
			alias: "osProposalApprovals_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osProposalApprovals.userUpdated,
			to: r.directusUsers.id,
			alias: "osProposalApprovals_userUpdated_directusUsers_id"
		}),
	},
	osProposals: {
		osProposalApprovals: r.many.osProposalApprovals(),
		osProposalBlocks: r.many.osProposalBlocks(),
		contacts: r.many.contacts(),
		osDeal: r.one.osDeals({
			from: r.osProposals.deal,
			to: r.osDeals.id
		}),
		organizationRelation: r.one.organizations({
			from: r.osProposals.organization,
			to: r.organizations.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osProposals.userCreated,
			to: r.directusUsers.id,
			alias: "osProposals_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osProposals.userUpdated,
			to: r.directusUsers.id,
			alias: "osProposals_userUpdated_directusUsers_id"
		}),
	},
	osProposalBlocks: {
		osProposal: r.one.osProposals({
			from: r.osProposalBlocks.osProposalsId,
			to: r.osProposals.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.osProposalBlocks.userCreated,
			to: r.directusUsers.id,
			alias: "osProposalBlocks_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.osProposalBlocks.userUpdated,
			to: r.directusUsers.id,
			alias: "osProposalBlocks_userUpdated_directusUsers_id"
		}),
	},
	osSettings: {
		directusFolder: r.one.directusFolders({
			from: r.osSettings.organizationFolderRoot,
			to: r.directusFolders.id
		}),
	},
	outlets: {
		directusFile: r.one.directusFiles({
			from: r.outlets.image,
			to: r.directusFiles.id
		}),
		categories: r.many.categories(),
		shorts: r.many.shorts({
			from: r.outlets.id.through(r.outletsShorts.outletsId),
			to: r.shorts.id.through(r.outletsShorts.shortsId)
		}),
	},
	pageBlocks: {
		directusFiles: r.many.directusFiles(),
		platforms: r.many.platform({
			from: r.pageBlocks.id.through(r.platformPageBlocks.pageBlocksId),
			to: r.platform.id.through(r.platformPageBlocks.platformId)
		}),
	},
	pagesBlog: {
		seoRelation: r.one.seo({
			from: r.pagesBlog.seo,
			to: r.seo.id
		}),
	},
	pagesProjects: {
		seoRelation: r.one.seo({
			from: r.pagesProjects.seo,
			to: r.seo.id
		}),
	},
	payments: {
		countries: r.many.countries(),
		currencies: r.many.currency(),
		directusUsers: r.many.directusUsers(),
		orders: r.many.orders(),
	},
	pickupLocationsCity: {
		pickupLocation: r.one.pickupLocations({
			from: r.pickupLocationsCity.pickupLocationsId,
			to: r.pickupLocations.id
		}),
	},
	pickupLocations: {
		pickupLocationsCities: r.many.pickupLocationsCity(),
		pickupLocationsCountries: r.many.pickupLocationsCountry(),
		pickupLocationsStates: r.many.pickupLocationsState(),
	},
	pickupLocationsCountry: {
		pickupLocation: r.one.pickupLocations({
			from: r.pickupLocationsCountry.pickupLocationsId,
			to: r.pickupLocations.id
		}),
	},
	pickupLocationsState: {
		pickupLocation: r.one.pickupLocations({
			from: r.pickupLocationsState.pickupLocationsId,
			to: r.pickupLocations.id
		}),
	},
	postGalleryItems: {
		directusFile: r.one.directusFiles({
			from: r.postGalleryItems.directusFilesId,
			to: r.directusFiles.id
		}),
	},
	productsCountries: {
		product: r.one.products({
			from: r.productsCountries.productsId,
			to: r.products.id
		}),
	},
	productsDirectusUsers: {
		product: r.one.products({
			from: r.productsDirectusUsers.productId,
			to: r.products.id
		}),
	},
	productsProductDesigner: {
		product: r.one.products({
			from: r.productsProductDesigner.productsId,
			to: r.products.id
		}),
	},
	followers: {
		profiles: r.many.profiles({
			from: r.followers.id.through(r.profilesFollowers.followersId),
			to: r.profiles.id.through(r.profilesFollowers.profilesId)
		}),
	},
	projectBoard: {
		comments: r.many.comments(),
		directusUsers: r.many.directusUsers(),
		directusFiles: r.many.directusFiles(),
		projects: r.many.projects({
			from: r.projectBoard.id.through(r.projectBoardProjects.projectBoardId),
			to: r.projects.id.through(r.projectBoardProjects.projectsId)
		}),
	},
	projects: {
		projectBoards: r.many.projectBoard(),
		directusFile: r.one.directusFiles({
			from: r.projects.icon,
			to: r.directusFiles.id,
			alias: "projects_icon_directusFiles_id"
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.projects.userCreated,
			to: r.directusUsers.id,
			alias: "projects_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.projects.userUpdated,
			to: r.directusUsers.id,
			alias: "projects_userUpdated_directusUsers_id"
		}),
		calendars: r.many.calendar(),
		comments: r.many.comments(),
		directusUsers: r.many.directusUsers({
			alias: "directusUsers_id_projects_id_via_projectsDirectusUsers"
		}),
		directusFiles: r.many.directusFiles({
			alias: "directusFiles_id_projects_id_via_projectsFiles"
		}),
		integrations: r.many.integrations(),
		lists: r.many.lists(),
		products: r.many.products(),
		projectTimelines: r.many.projectTimeline(),
		regions: r.many.region({
			from: r.projects.id.through(r.projectsRegion.projectsId),
			to: r.region.id.through(r.projectsRegion.regionId)
		}),
	},
	projectTimeline: {
		projects: r.many.projects({
			from: r.projectTimeline.id.through(r.projectsProjectTimeline.projectTimelineId),
			to: r.projects.id.through(r.projectsProjectTimeline.projectsId)
		}),
	},
	radiosMusicchart: {
		radio: r.one.radios({
			from: r.radiosMusicchart.radiosId,
			to: r.radios.id
		}),
	},
	reactionsDirectusUsers: {
		reaction: r.one.reactions({
			from: r.reactionsDirectusUsers.reactionId,
			to: r.reactions.id
		}),
	},
	relatedProducts: {
		directusUser: r.one.directusUsers({
			from: r.relatedProducts.user,
			to: r.directusUsers.id
		}),
		products: r.many.products(),
	},
	reportDirectusUsers: {
		report: r.one.report({
			from: r.reportDirectusUsers.reportId,
			to: r.report.id
		}),
	},
	returns: {
		orders: r.many.orders(),
		products: r.many.products(),
	},
	reviewsProducts: {
		product: r.one.products({
			from: r.reviewsProducts.productsId,
			to: r.products.id
		}),
	},
	seasons: {
		video: r.one.videos({
			from: r.seasons.name,
			to: r.videos.id,
			alias: "seasons_name_videos_id"
		}),
		videos: r.many.videos({
			from: r.seasons.id.through(r.seasonsVideos.seasonsId),
			to: r.videos.id.through(r.seasonsVideos.videosId),
			alias: "seasons_id_videos_id_via_seasonsVideos"
		}),
	},
	shipment: {
		orderRelation: r.one.orders({
			from: r.shipment.order,
			to: r.orders.id
		}),
		addresses: r.many.address(),
		shipmentComments: r.many.shipmentComments(),
		products: r.many.products(),
		shipmentTrackings: r.many.shipmentTracking(),
	},
	shipmentComments: {
		shipment: r.one.shipment({
			from: r.shipmentComments.parentId,
			to: r.shipment.id
		}),
	},
	shipmentTracking: {
		shipment: r.one.shipment({
			from: r.shipmentTracking.parentId,
			to: r.shipment.id
		}),
	},
	shippingAddresses: {
		cities: r.many.cities(),
		countries: r.many.countries(),
		directusUsers: r.many.directusUsers(),
		orders: r.many.orders(),
		states: r.many.states({
			from: r.shippingAddresses.id.through(r.shippingAddressesStates.shippingAddressesId),
			to: r.states.id.through(r.shippingAddressesStates.statesId)
		}),
	},
	shopType: {
		shops: r.many.shops({
			from: r.shopType.id.through(r.shopTypeShops.shopTypeId),
			to: r.shops.id.through(r.shopTypeShops.shopsId)
		}),
		spaces: r.many.spaces({
			from: r.shopType.id.through(r.spacesShopType.shopTypeId),
			to: r.spaces.id.through(r.spacesShopType.spacesId)
		}),
	},
	shopsAgreements: {
		shop: r.one.shops({
			from: r.shopsAgreements.shopsId,
			to: r.shops.id
		}),
	},
	shopsDirectusUsers: {
		shop: r.one.shops({
			from: r.shopsDirectusUsers.shopsId,
			to: r.shops.id
		}),
	},
	shopsFiles: {
		shop: r.one.shops({
			from: r.shopsFiles.shopsId,
			to: r.shops.id
		}),
	},
	shortsDirectusUsers: {
		short: r.one.shorts({
			from: r.shortsDirectusUsers.shortsId,
			to: r.shorts.id
		}),
	},
	sitePreferenceCategories: {
		category: r.one.categories({
			from: r.sitePreferenceCategories.categoriesId,
			to: r.categories.id
		}),
	},
	sitePreferenceCountries: {
		country: r.one.countries({
			from: r.sitePreferenceCountries.countriesId,
			to: r.countries.id
		}),
	},
	sitePreferenceDepartments: {
		department: r.one.departments({
			from: r.sitePreferenceDepartments.departmentsId,
			to: r.departments.id
		}),
	},
	sitePreferenceProducts: {
		product: r.one.products({
			from: r.sitePreferenceProducts.productsId,
			to: r.products.id
		}),
	},
	spaceProducts: {
		product: r.one.products({
			from: r.spaceProducts.productsId,
			to: r.products.id
		}),
	},
	spaceTypes: {
		directusFile: r.one.directusFiles({
			from: r.spaceTypes.icon,
			to: r.directusFiles.id
		}),
		spaces: r.many.spaces({
			from: r.spaceTypes.id.through(r.spacesSpaceTypes.spaceTypesId),
			to: r.spaces.id.through(r.spacesSpaceTypes.spacesId)
		}),
		templates: r.many.templates({
			from: r.spaceTypes.id.through(r.templatesSpaceTypes.spaceTypesId),
			to: r.templates.id.through(r.templatesSpaceTypes.templatesId)
		}),
	},
	spacesLiveRooms: {
		space: r.one.spaces({
			from: r.spacesLiveRooms.spacesId,
			to: r.spaces.id
		}),
	},
	streams: {
		video: r.one.videos({
			from: r.streams.streamId,
			to: r.videos.id
		}),
		ratings: r.many.ratings(),
	},
	subscriptionsDirectusUsers: {
		subscription: r.one.subscriptions({
			from: r.subscriptionsDirectusUsers.subscriptionsId,
			to: r.subscriptions.id
		}),
	},
	subscriptions: {
		subscriptionsDirectusUsers: r.many.subscriptionsDirectusUsers(),
		products: r.many.products(),
	},
	taxes: {
		countries: r.many.countries(),
		states: r.many.states(),
	},
	team: {
		directusFile: r.one.directusFiles({
			from: r.team.image,
			to: r.directusFiles.id
		}),
		directusUserUserCreated: r.one.directusUsers({
			from: r.team.userCreated,
			to: r.directusUsers.id,
			alias: "team_userCreated_directusUsers_id"
		}),
		directusUserUserUpdated: r.one.directusUsers({
			from: r.team.userUpdated,
			to: r.directusUsers.id,
			alias: "team_userUpdated_directusUsers_id"
		}),
	},
	transactions: {
		orderRelation: r.one.orders({
			from: r.transactions.order,
			to: r.orders.id
		}),
		currencies: r.many.currency(),
	},
	translations: {
		postgresstores: r.many.postgresstores(),
	},
	userFriends: {
		posts: r.many.posts(),
	},
	variants: {
		product: r.one.products({
			from: r.variants.productId,
			to: r.products.id
		}),
	},
	vibezClips: {
		products: r.many.products({
			from: r.vibezClips.id.through(r.vibezProductMap.clipId),
			to: r.products.id.through(r.vibezProductMap.productId)
		}),
	},
	objectsInStorage: {
		bucketsInStorage: r.one.bucketsInStorage({
			from: r.objectsInStorage.bucketId,
			to: r.bucketsInStorage.id
		}),
	},
	bucketsInStorage: {
		objectsInStorages: r.many.objectsInStorage(),
		s3MultipartUploadsInStoragesBucketId: r.many.s3MultipartUploadsInStorage({
			alias: "s3MultipartUploadsInStorage_bucketId_bucketsInStorage_id"
		}),
		s3MultipartUploadsInStoragesViaS3MultipartUploadsPartsInStorage: r.many.s3MultipartUploadsInStorage({
			from: r.bucketsInStorage.id.through(r.s3MultipartUploadsPartsInStorage.bucketId),
			to: r.s3MultipartUploadsInStorage.id.through(r.s3MultipartUploadsPartsInStorage.uploadId),
			alias: "bucketsInStorage_id_s3MultipartUploadsInStorage_id_via_s3MultipartUploadsPartsInStorage"
		}),
	},
	s3MultipartUploadsInStorage: {
		bucketsInStorage: r.one.bucketsInStorage({
			from: r.s3MultipartUploadsInStorage.bucketId,
			to: r.bucketsInStorage.id,
			alias: "s3MultipartUploadsInStorage_bucketId_bucketsInStorage_id"
		}),
		bucketsInStorages: r.many.bucketsInStorage({
			alias: "bucketsInStorage_id_s3MultipartUploadsInStorage_id_via_s3MultipartUploadsPartsInStorage"
		}),
	},
	vectorIndexesInStorage: {
		bucketsVectorsInStorage: r.one.bucketsVectorsInStorage({
			from: r.vectorIndexesInStorage.bucketId,
			to: r.bucketsVectorsInStorage.id
		}),
	},
	bucketsVectorsInStorage: {
		vectorIndexesInStorages: r.many.vectorIndexesInStorage(),
	},
}))