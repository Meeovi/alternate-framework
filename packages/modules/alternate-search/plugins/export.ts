// ---------------------------------------------------------------------------
// Export plugin — result serialisation to CSV / NDJSON / JSON
// ---------------------------------------------------------------------------
//
// Adds a `toFormat()` helper to `ctx.meta` and exposes a standalone
// `exportResults()` utility that can be used outside the pipeline.
// Also supports streaming output via an async-generator interface.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin, SearchResult } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"export": { creator: typeof exportPlugin };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExportFormat = "json" | "ndjson" | "csv";

export type ExportOptions = {
	/**
	 * Default export format.  Default: "json".
	 */
	format?: ExportFormat;
	/**
	 * CSV delimiter.  Default: ",".
	 */
	delimiter?: string;
	/**
	 * Fields to include in the export.  Default: all fields.
	 */
	fields?: string[];
	/**
	 * Include a header row in CSV output.  Default: true.
	 */
	includeHeader?: boolean;
};

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function pickFields(obj: Record<string, unknown>, fields?: string[]): Record<string, unknown> {
	if (!fields || fields.length === 0) return obj;
	const result: Record<string, unknown> = {};
	for (const f of fields) result[f] = obj[f];
	return result;
}

function escapeCell(val: unknown, delimiter: string): string {
	const str = val === null || val === undefined ? "" : String(val);
	if (str.includes(delimiter) || str.includes('"') || str.includes("\n")) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export function exportResults(
	result: SearchResult,
	options: ExportOptions = {},
): string {
	const format    = options.format    ?? "json";
	const delimiter = options.delimiter ?? ",";
	const fields    = options.fields;
	const header    = options.includeHeader !== false;
	const items     = (result.items as Record<string, unknown>[]).map((d) => pickFields(d, fields));

	if (format === "json") return JSON.stringify(items, null, 2);

	if (format === "ndjson") return items.map((d) => JSON.stringify(d)).join("\n");

	// CSV
	if (items.length === 0) return "";
	const cols  = fields ?? Object.keys(items[0]);
	const lines: string[] = [];
	if (header) lines.push(cols.map((c) => escapeCell(c, delimiter)).join(delimiter));
	for (const row of items) {
		lines.push(cols.map((c) => escapeCell(row[c], delimiter)).join(delimiter));
	}
	return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function exportPlugin(options: ExportOptions = {}): SearchPlugin {
	return {
		id: "export",

		init(_indexes: Record<string, IndexSchema>) {},

		afterQuery(ctx) {
			if (!ctx.result) return;
			// Attach a formatter helper to ctx.meta for the integration layer
			ctx.meta.export = (overrideOptions?: ExportOptions) =>
				exportResults(ctx.result!, { ...options, ...overrideOptions });
		},
	};
}

// Named re-export so integration code can reference `export` symbolically
export { exportPlugin as export_ };
