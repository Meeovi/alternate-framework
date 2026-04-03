// ---------------------------------------------------------------------------
// Geospatial plugin — geo-distance and bounding-box search helpers
// ---------------------------------------------------------------------------
//
// Normalises `ctx.query.geo` into adapter-specific `_options.geo` structures
// for backends with native geo support (Elasticsearch geo_distance / geo_shape,
// Meilisearch geo radius, Typesense geosearch).
//
// For adapters without native geo support the plugin performs a client-side
// bounding-box pre-filter and haversine distance post-filter on result items.
// ---------------------------------------------------------------------------

import type { GeoPoint, IndexSchema, SearchDocument, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"geospatial": { creator: typeof geospatial };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DistanceUnit = "km" | "mi" | "m";

export type GeospatialOptions = {
	/**
	 * Default coordinate field name on indexed documents. Default: "_geo".
	 */
	defaultField?: string;
	/**
	 * Default distance unit. Default: "km".
	 */
	unit?: DistanceUnit;
	/**
	 * When true, perform in-process distance filtering when the adapter doesn't
	 * handle geo natively. Default: true.
	 */
	clientSideFallback?: boolean;
};

// ---------------------------------------------------------------------------
// Haversine formula
// ---------------------------------------------------------------------------

function haversineKm(a: GeoPoint, b: GeoPoint): number {
	const R = 6371;
	const dLat = ((b.lat - a.lat) * Math.PI) / 180;
	const dLng = ((b.lng - a.lng) * Math.PI) / 180;
	const sin2Lat = Math.sin(dLat / 2) ** 2;
	const sin2Lng = Math.sin(dLng / 2) ** 2;
	const hav = sin2Lat + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sin2Lng;
	return R * 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
}

function toKm(distance: number, unit: DistanceUnit): number {
	if (unit === "mi") return distance * 1.60934;
	if (unit === "m")  return distance / 1000;
	return distance;
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function geospatial(options: GeospatialOptions = {}): SearchPlugin {
	const defaultField = options.defaultField ?? "_geo";
	const unit         = options.unit ?? "km";
	const clientFallback = options.clientSideFallback !== false;

	return {
		id: "geospatial",

		init(_indexes: Record<string, IndexSchema>) {},

		beforeQuery(ctx) {
			const geo = ctx.query.geo;
			if (!geo) return;

			const field = geo.field ?? defaultField;
			const radiusKm = toKm(geo.radiusKm, unit);

			// Inject structured geo options for adapters that support it
			ctx.query._options = {
				...ctx.query._options,
				geo: {
					field,
					center: geo.center,
					radiusKm,
					unit: "km",
				},
			};

			ctx.meta.geoField   = field;
			ctx.meta.geoRadiusKm = radiusKm;
		},

		afterQuery(ctx) {
			if (!clientFallback) return;
			const geo = ctx.query.geo;
			if (!geo) return;
			if (!ctx.result || ctx.result.items.length === 0) return;

			// Skip if adapter already filtered (assumed when adapter capability geo is present)
			if ((ctx.meta.adapterCapabilities as string[] | undefined)?.includes("geo")) return;

			const field   = geo.field ?? defaultField;
			const radiusKm = toKm(geo.radiusKm, unit);
			const center  = geo.center;

			const filtered = ctx.result.items.filter((item) => {
				const doc = item as SearchDocument;
				const coord = doc[field] as { lat?: unknown; lng?: unknown } | null | undefined;
				if (!coord?.lat || !coord?.lng) return false;
				const lat = Number(coord.lat);
				const lng = Number(coord.lng);
				if (isNaN(lat) || isNaN(lng)) return false;
				const dist = haversineKm(center, { lat, lng });
				(doc as Record<string, unknown>)._geoDistance = dist;
				return dist <= radiusKm;
			});

			ctx.result = {
				...ctx.result,
				items: filtered as typeof ctx.result.items,
				total: filtered.length,
			};
		},
	};
}
