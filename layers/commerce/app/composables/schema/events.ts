export interface MeeoviEvent {
	id: number
	status?: string | null
	sort?: number | null
	user_created?: string | null
	date_created?: string | null
	user_updated?: string | null
	date_updated?: string | null
	name?: string | null
	description?: string | null
	event_calendar?: string | null
	image?: string | null
	location?: string | null
	start_time?: string | null
	end_time?: string | null
	url?: string | null
	postalcode?: string | null
	type?: string | null
	qr_code?: string | null
	check_in?: string | null
	rsvp_status?: string | null
	rsvp_policies?: Record<string, unknown> | null
	date?: string | null
	slug?: string | null
	tickets_url?: string | null
	address?: string | null
	// relations omitted
}


