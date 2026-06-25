// ---------------------------------------------------------------------------
// MCP plugin — Model Context Protocol tool / resource exposure
// ---------------------------------------------------------------------------
//
// Exposes the search engine as an MCP tool and (optionally) an MCP resource
// so that LLM clients (GitHub Copilot, Claude Desktop, Cursor, etc.) can
// call it directly.
//
// The plugin does NOT start a server — it returns a handler object via
// `getMcpHandler()` on the returned plugin instance.  You attach the handler
// to your MCP server (stdio / SSE / HTTP transport) separately.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin, SearchQuery, SearchResult } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"mcp": { creator: typeof mcp };
	}
}

// ---------------------------------------------------------------------------
// MCP protocol types (minimal — avoids a hard peer dependency)
// ---------------------------------------------------------------------------

export type McpToolDefinition = {
	name: string;
	description: string;
	inputSchema: {
		type: "object";
		properties: Record<string, unknown>;
		required?: string[];
	};
};

export type McpCallResult = {
	content: Array<{ type: "text"; text: string }>;
	isError?: boolean;
};

export type McpHandler = {
	listTools(): McpToolDefinition[];
	callTool(name: string, input: Record<string, unknown>): Promise<McpCallResult>;
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type McpExecutor = (
	indexName: string,
	query: SearchQuery,
) => Promise<SearchResult>;

export type McpOptions = {
	/**
	 * The function that executes a search query.
	 * Typically: `(index, query) => search.query(index, query)`.
	 */
	execute: McpExecutor;
	/**
	 * Override the MCP tool name.  Default: "search".
	 */
	toolName?: string;
	/**
	 * Human-readable description shown in the tool listing.
	 */
	toolDescription?: string;
	/**
	 * Available index names exposed to the LLM.
	 */
	indexes?: string[];
	/**
	 * Maximum number of result items returned in the MCP response.  Default: 10.
	 */
	maxResults?: number;
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function mcp(options: McpOptions): SearchPlugin & { getMcpHandler(): McpHandler } {
	const toolName = options.toolName ?? "search";
	const maxResults = options.maxResults ?? 10;

	function buildTool(): McpToolDefinition {
		return {
			name: toolName,
			description:
				options.toolDescription ??
				"Search a full-text / vector index and return ranked results.",
			inputSchema: {
				type: "object",
				properties: {
					index: {
						type: "string",
						description: "Index to search.",
						...(options.indexes?.length ? { enum: options.indexes } : {}),
					},
					query: {
						type: "string",
						description: "Natural language or keyword search query.",
					},
					limit: {
						type: "number",
						description: "Maximum results to return.",
						default: maxResults,
					},
				},
				required: ["index", "query"],
			},
		};
	}

	function getMcpHandler(): McpHandler {
		return {
			listTools() {
				return [buildTool()];
			},

			async callTool(name, input) {
				if (name !== toolName) {
					return {
						content: [{ type: "text", text: `Unknown tool: ${name}` }],
						isError: true,
					};
				}

				const indexName = String(input.index ?? "");
				const q         = String(input.query ?? "");
				const limit     = Math.min(Number(input.limit ?? maxResults), maxResults);

				try {
					const result = await options.execute(indexName, { q, _options: { limit } });
					const text   = result.items
						.slice(0, limit)
						.map((item, i) => {
							const doc = item as Record<string, unknown>;
							return `${i + 1}. ${JSON.stringify(doc, null, 0)}`;
						})
						.join("\n");

					return {
						content: [{
							type: "text",
							text: `Found ${result.total} results (showing ${Math.min(limit, result.items.length)}):\n\n${text}`,
						}],
					};
				} catch (err) {
					return {
						content: [{ type: "text", text: `Search error: ${err instanceof Error ? err.message : String(err)}` }],
						isError: true,
					};
				}
			},
		};
	}

	return {
		id: "mcp",
		getMcpHandler,

		init(_indexes: Record<string, IndexSchema>) {},
	};
}
