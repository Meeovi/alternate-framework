export interface MeeoviCategory {
	id: number
	name?: string | null
	description?: string | null
	content?: string | null
	image?: string | null
	menus?: Record<string, unknown> | null
	uid?: string | null
	color?: string | null
	colortext?: string | null
	slug?: string | null
	// relations omitted: articles_categories[], brands_categories[], ...
}


