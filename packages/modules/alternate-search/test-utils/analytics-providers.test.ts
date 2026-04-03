import { describe, expect, it, vi } from "vitest";
import {
	createCsvAnalyticsProvider,
	createFileAnalyticsProvider,
	createOpenTelemetryAnalyticsProvider,
	createPostHogAnalyticsProvider,
	createSegmentAnalyticsProvider,
} from "../analytics/index";
import type { SearchAnalyticsEvent } from "../core/types";

const baseEvent: SearchAnalyticsEvent = {
	event: "search_clicked",
	timestamp: new Date("2026-04-02T00:00:00.000Z").toISOString(),
	requestId: "req_123",
	indexName: "products",
	query: "shoes",
	userId: "user_1",
	documentId: "doc_99",
	position: 1,
	queryId: "query_1",
};

describe("analytics providers", () => {
	it("sends a PostHog capture payload", async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
		const provider = createPostHogAnalyticsProvider({
			apiKey: "ph_test",
			fetch: fetchMock,
		});

		await provider.track(baseEvent);

		expect(fetchMock).toHaveBeenCalledOnce();
		expect(fetchMock.mock.calls[0]?.[0]).toBe("https://us.i.posthog.com/capture/");
		expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: "POST" });
	});

	it("sends a Segment track payload", async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
		const provider = createSegmentAnalyticsProvider({
			writeKey: "segment_test",
			fetch: fetchMock,
		});

		await provider.track(baseEvent);

		expect(fetchMock).toHaveBeenCalledOnce();
		expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.segment.io/v1/track");
		expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: "POST" });
	});

	it("writes JSONL analytics events", async () => {
		const append = vi.fn();
		const provider = createFileAnalyticsProvider({
			writer: { append },
		});

		await provider.track(baseEvent);

		expect(append).toHaveBeenCalledOnce();
		expect(String(append.mock.calls[0]?.[0])).toContain('"event":"search_clicked"');
	});

	it("writes CSV analytics events with a header", async () => {
		const append = vi.fn();
		const provider = createCsvAnalyticsProvider({
			writer: { append },
			columns: ["timestamp", "event", "documentId"],
		});

		await provider.track(baseEvent);

		expect(append).toHaveBeenCalledTimes(2);
		expect(append.mock.calls[0]?.[0]).toBe("timestamp,event,documentId\n");
		expect(append.mock.calls[1]?.[0]).toContain("search_clicked");
	});

	it("emits OpenTelemetry span and metrics from the standardized event schema", async () => {
		const add = vi.fn();
		const record = vi.fn();
		const spanSetAttribute = vi.fn();
		const spanAddEvent = vi.fn();
		const spanEnd = vi.fn();

		const provider = createOpenTelemetryAnalyticsProvider({
			serviceName: "alternate-search",
			meter: {
				createCounter() {
					return { add };
				},
				createHistogram() {
					return { record };
				},
			},
			tracer: {
				startSpan() {
					return {
						setAttribute: spanSetAttribute,
						addEvent: spanAddEvent,
						end: spanEnd,
					};
				},
			},
		});

		await provider.track({
			event: "search_performed",
			timestamp: new Date("2026-04-02T00:00:00.000Z").toISOString(),
			requestId: "req_otel",
			indexName: "products",
			query: "boots",
			total: 12,
			page: 1,
			pageSize: 10,
			took: 48,
		});

		expect(add).toHaveBeenCalledOnce();
		expect(record).toHaveBeenCalledOnce();
		expect(spanAddEvent).toHaveBeenCalledOnce();
		expect(spanEnd).toHaveBeenCalledOnce();
		expect(spanSetAttribute).not.toHaveBeenCalled();
	});
});