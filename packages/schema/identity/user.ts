export interface MeeoviUser {
	instance_id?: string | null
	id: string
	aud?: string | null
	role?: string | null
	email?: string | null
	encrypted_password?: string | null
	email_confirmed_at?: string | null
	invited_at?: string | null
	confirmation_token?: string | null
	confirmation_sent_at?: string | null
	recovery_token?: string | null
	recovery_sent_at?: string | null
	email_change_token_new?: string | null
	email_change?: string | null
	email_change_sent_at?: string | null
	last_sign_in_at?: string | null
	raw_app_meta_data?: Record<string, unknown> | null
	raw_user_meta_data?: Record<string, unknown> | null
	is_super_admin?: boolean | null
	created_at?: string | null
	updated_at?: string | null
	phone?: string | null
	phone_confirmed_at?: string | null
	phone_change?: string | null
	phone_change_token?: string | null
	phone_change_sent_at?: string | null
	confirmed_at?: string | null
	email_change_token_current?: string | null
	email_change_confirm_status?: number | null
	banned_until?: string | null
	reauthentication_token?: string | null
	reauthentication_sent_at?: string | null
	is_sso_user?: boolean
	deleted_at?: string | null
	is_anonymous?: boolean
	identities?: Record<string, unknown>[]
	mfa_factors?: Record<string, unknown>[]
	oauth_authorizations?: Record<string, unknown>[]
	oauth_consents?: Record<string, unknown>[]
	one_time_tokens?: Record<string, unknown>[]
	sessions?: Record<string, unknown>[]
	emoji_reactions?: Record<string, unknown>[]
	profiles?: Record<string, unknown> | null
}


