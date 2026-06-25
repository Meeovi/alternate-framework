# Analytics providers

`alternate-search` now ships first-party analytics providers for hosted product analytics and durable local logging.

## Built-in providers

- `createPostHogAnalyticsProvider(...)`
- `createSegmentAnalyticsProvider(...)`
- `createFileAnalyticsProvider(...)` for JSONL append-only logs
- `createCsvAnalyticsProvider(...)` for CSV exports or spreadsheet ingestion
- `createOpenTelemetryAnalyticsProvider(...)` for traces and metrics

## Example

```ts
import {
  createCsvAnalyticsProvider,
  createFileAnalyticsProvider,
  createOpenTelemetryAnalyticsProvider,
  createPostHogAnalyticsProvider,
  createSearch,
  createSegmentAnalyticsProvider,
} from "alternate-search";

const search = createSearch({
  adapter,
  indexes,
  analytics: [
    createPostHogAnalyticsProvider({ apiKey: process.env.POSTHOG_API_KEY! }),
    createSegmentAnalyticsProvider({ writeKey: process.env.SEGMENT_WRITE_KEY! }),
    createFileAnalyticsProvider({ filePath: "./tmp/search-events.jsonl" }),
    createCsvAnalyticsProvider({ filePath: "./tmp/search-events.csv" }),
    createOpenTelemetryAnalyticsProvider({
      tracer,
      meter,
      serviceName: "alternate-search",
    }),
  ],
});

await search.trackClick({
  requestId: "req_123",
  indexName: "products",
  query: "running shoes",
  documentId: "sku_42",
  position: 1,
});
```

## Notes

- PostHog events are sent to `/capture/` using the standardized search event names.
- Segment events are sent through the Track API with a human-readable event name and the full standardized payload under `properties`.
- File logging writes one JSON event per line.
- CSV logging writes a header row by default and serializes `metadata` as JSON.
- OpenTelemetry provider emits one event counter per analytics event and query latency histogram entries for `search_performed` events.

For a combined production example with Redis-backed cache storage and targeted invalidation hooks (`invalidateByIndex` and `invalidateByTenant`), see `../demo/node/production.ts`.