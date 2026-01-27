export interface MeeoviProfile {
	id: string
	username?: string | null
	birth_date?: string | null
	description?: string | null
	slug?: string | null
	company?: string | null
	activitypub_handle?: string | null
	dropshipping_partner_id?: string | null
	user?: string | null
	commerce_auth_id?: string | null
	cms_auth_id?: string | null
	keycloak_id?: string | null
	supabase_user_id?: string | null
	role?: string | null
	seller_requested?: boolean | null
	seller_approved?: boolean | null
	position?: string | null
	links?: Record<string, unknown> | null
	magento_customer_id?: string | null
	avatar?: string | null
	// relations omitted: media[], directus_files, users, etc.
}


