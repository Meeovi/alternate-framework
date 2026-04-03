// ---------------------------------------------------------------------------
// Clusters plugin — cluster-health monitoring and node routing
// ---------------------------------------------------------------------------
//
// Maintains a list of backend nodes with health state and injects the
// preferred (least-loaded / healthiest) node URL into
// `ctx.query._options.nodeUrl` so that adapters can use it for routing.
//
// Health is assessed via periodic HTTP GET to a configurable endpoint
// (default: `/_cluster/health` for Elasticsearch-compatible backends).
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"clusters": { creator: typeof clusters };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NodeStatus = "healthy" | "degraded" | "dead";

export type ClusterNode = {
	url: string;
	/**
	 * Relative weight for load-balancing.  Higher = more traffic.  Default: 1.
	 */
	weight?: number;
};

export type ClustersOptions = {
	nodes: ClusterNode[];
	/**
	 * Health-check endpoint path.  Default: "/_health".
	 */
	healthPath?: string;
	/**
	 * Milliseconds between health checks.  0 = disabled.  Default: 30_000.
	 */
	healthCheckIntervalMs?: number;
	/**
	 * Request timeout for health checks.  Default: 3000.
	 */
	healthCheckTimeoutMs?: number;
	/**
	 * Called when a node transitions status.
	 */
	onStatusChange?: (nodeUrl: string, status: NodeStatus) => void;
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function clusters(options: ClustersOptions): SearchPlugin & {
	getNodeStatuses(): Record<string, NodeStatus>;
} {
	const nodeStatuses: Record<string, NodeStatus> = {};
	let timer: ReturnType<typeof setInterval> | undefined;

	for (const n of options.nodes) nodeStatuses[n.url] = "healthy";

	function healthyNodes(): ClusterNode[] {
		return options.nodes.filter((n) => nodeStatuses[n.url] !== "dead");
	}

	function pickNode(): ClusterNode | undefined {
		const live = healthyNodes();
		if (!live.length) return undefined;
		const totalWeight = live.reduce((s, n) => s + (n.weight ?? 1), 0);
		let rand = Math.random() * totalWeight;
		for (const n of live) {
			rand -= n.weight ?? 1;
			if (rand <= 0) return n;
		}
		return live[0];
	}

	async function checkHealth(node: ClusterNode): Promise<void> {
		const path = options.healthPath ?? "/_health";
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), options.healthCheckTimeoutMs ?? 3000);
		try {
			const res = await fetch(`${node.url}${path}`, { signal: controller.signal });
			const next: NodeStatus = res.ok ? "healthy" : "degraded";
			if (nodeStatuses[node.url] !== next) {
				nodeStatuses[node.url] = next;
				options.onStatusChange?.(node.url, next);
			}
		} catch {
			if (nodeStatuses[node.url] !== "dead") {
				nodeStatuses[node.url] = "dead";
				options.onStatusChange?.(node.url, "dead");
			}
		} finally {
			clearTimeout(timeout);
		}
	}

	return {
		id: "clusters",
		getNodeStatuses() { return { ...nodeStatuses }; },

		init(_indexes: Record<string, IndexSchema>) {
			const interval = options.healthCheckIntervalMs ?? 30_000;
			if (interval > 0) {
				for (const node of options.nodes) void checkHealth(node);
				timer = setInterval(() => {
					for (const node of options.nodes) void checkHealth(node);
				}, interval);
				if (typeof timer === "object" && timer !== null && "unref" in timer) {
					(timer as { unref(): void }).unref();
				}
			}
		},

		beforeQuery(ctx) {
			const node = pickNode();
			if (node) {
				ctx.query._options = { ...ctx.query._options, nodeUrl: node.url };
				ctx.meta.selectedNode = node.url;
			}
		},
	};
}
