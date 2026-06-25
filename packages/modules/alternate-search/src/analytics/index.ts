import type {
  SearchAnalyticsEvent,
  SearchAnalyticsProvider,
  SearchClickAnalyticsEvent,
  SearchConversionAnalyticsEvent,
  SearchErrorAnalyticsEvent,
  SearchPerformedAnalyticsEvent,
} from "../core/types";

export type SearchAnalyticsFetch = typeof fetch;

export type SearchAnalyticsBridge = {
  track(event: SearchAnalyticsEvent): Promise<void>;
  trackPerformed(event: Omit<SearchPerformedAnalyticsEvent, "event" | "timestamp">): Promise<void>;
  trackClick(event: Omit<SearchClickAnalyticsEvent, "event" | "timestamp">): Promise<void>;
  trackConversion(event: Omit<SearchConversionAnalyticsEvent, "event" | "timestamp">): Promise<void>;
  trackError(event: Omit<SearchErrorAnalyticsEvent, "event" | "timestamp">): Promise<void>;
};

export type SearchAnalyticsWriter = {
  append(content: string): Promise<void> | void;
};

export type PostHogAnalyticsProviderOptions = {
  apiKey: string;
  host?: string;
  fetch?: SearchAnalyticsFetch;
  headers?: Record<string, string>;
  distinctId?: (event: SearchAnalyticsEvent) => string | undefined;
};

export type SegmentAnalyticsProviderOptions = {
  writeKey: string;
  host?: string;
  fetch?: SearchAnalyticsFetch;
  headers?: Record<string, string>;
  anonymousId?: (event: SearchAnalyticsEvent) => string | undefined;
};

export type FileAnalyticsProviderOptions = {
  filePath?: string;
  writer?: SearchAnalyticsWriter;
};

export type CsvAnalyticsProviderOptions = FileAnalyticsProviderOptions & {
  delimiter?: string;
  includeHeader?: boolean;
  columns?: string[];
};

export type OpenTelemetrySpan = {
  setAttribute(key: string, value: string | number | boolean): void;
  addEvent?(name: string, attributes?: Record<string, unknown>): void;
  recordException?(error: Error): void;
  end(): void;
};

export type OpenTelemetryTracer = {
  startSpan(name: string, options?: { attributes?: Record<string, unknown> }): OpenTelemetrySpan;
};

export type OpenTelemetryCounter = {
  add(value: number, attributes?: Record<string, unknown>): void;
};

export type OpenTelemetryHistogram = {
  record(value: number, attributes?: Record<string, unknown>): void;
};

export type OpenTelemetryMeter = {
  createCounter(name: string, options?: { description?: string; unit?: string }): OpenTelemetryCounter;
  createHistogram(name: string, options?: { description?: string; unit?: string }): OpenTelemetryHistogram;
};

export type OpenTelemetryAnalyticsProviderOptions = {
  tracer?: OpenTelemetryTracer;
  meter?: OpenTelemetryMeter;
  serviceName?: string;
  spanName?: string | ((event: SearchAnalyticsEvent) => string);
  counterName?: string;
  durationHistogramName?: string;
  staticAttributes?: Record<string, string | number | boolean>;
};

async function dispatch(
  providers: SearchAnalyticsProvider[],
  event: SearchAnalyticsEvent,
): Promise<void> {
  await Promise.all(
    providers.map((provider) => Promise.resolve(provider.track(event))),
  );
}

function withBaseEvent<T extends SearchAnalyticsEvent>(
  event: Omit<T, "timestamp">,
): T {
  return {
    ...event,
    timestamp: new Date().toISOString(),
  } as T;
}

function getFetch(fetchImpl?: SearchAnalyticsFetch): SearchAnalyticsFetch {
  const resolved = fetchImpl ?? globalThis.fetch;
  if (!resolved) {
    throw new Error("Analytics provider requires fetch in this runtime");
  }
  return resolved;
}

function normalizeHost(host: string): string {
  return host.replace(/\/+$/, "");
}

function toProperties(event: SearchAnalyticsEvent): Record<string, unknown> {
  const { event: eventName, timestamp, ...rest } = event;
  return {
    event: eventName,
    timestamp,
    ...rest,
  };
}

function getDistinctId(event: SearchAnalyticsEvent): string {
  return event.userId ?? event.tenantId ?? event.requestId ?? "anonymous";
}

function encodeBase64(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value).toString("base64");
  }
  if (typeof btoa !== "undefined") {
    return btoa(value);
  }
  throw new Error("Analytics provider could not encode a base64 header in this runtime");
}

function getSegmentName(event: SearchAnalyticsEvent): string {
  return event.event
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

async function getWriter(options: FileAnalyticsProviderOptions): Promise<SearchAnalyticsWriter> {
  if (options.writer) {
    return options.writer;
  }
  if (!options.filePath) {
    throw new Error("File analytics provider requires either filePath or writer");
  }

  const fs = await import("node:fs/promises");
  return {
    append(content) {
      return fs.appendFile(options.filePath!, content, "utf8");
    },
  };
}

function getCsvColumns(columns?: string[]): string[] {
  return columns ?? [
    "timestamp",
    "event",
    "requestId",
    "indexName",
    "query",
    "userId",
    "tenantId",
    "backend",
    "documentId",
    "position",
    "queryId",
    "conversionType",
    "value",
    "currency",
    "total",
    "page",
    "pageSize",
    "took",
    "errorCode",
    "message",
    "status",
    "metadata",
  ];
}

function toCsvCell(value: unknown, delimiter: string): string {
  if (value === undefined || value === null) return "";
  const stringValue = typeof value === "string"
    ? value
    : JSON.stringify(value);
  if (stringValue.includes("\n") || stringValue.includes('"') || stringValue.includes(delimiter)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function toCsvLine(event: SearchAnalyticsEvent, columns: string[], delimiter: string): string {
  const row = columns.map((column) => {
    const value = column === "metadata"
      ? event.metadata
      : (event as Record<string, unknown>)[column];
    return toCsvCell(value, delimiter);
  });
  return `${row.join(delimiter)}\n`;
}

function toTelemetryAttributes(
  event: SearchAnalyticsEvent,
  staticAttributes: Record<string, string | number | boolean> = {},
): Record<string, string | number | boolean> {
  const attributes: Record<string, string | number | boolean> = {
    ...staticAttributes,
    "search.event": event.event,
    "search.timestamp": event.timestamp,
  };

  if (event.requestId) attributes["search.request_id"] = event.requestId;
  if (event.indexName) attributes["search.index"] = event.indexName;
  if (event.query) attributes["search.query"] = event.query;
  if (event.userId) attributes["search.user_id"] = event.userId;
  if (event.tenantId) attributes["search.tenant_id"] = event.tenantId;
  if (event.backend) attributes["search.backend"] = event.backend;
  if (event.event === "search_performed") {
    attributes["search.total"] = event.total;
    attributes["search.page"] = event.page;
    attributes["search.page_size"] = event.pageSize;
    if (typeof event.took === "number") attributes["search.took_ms"] = event.took;
  }
  if (event.event === "search_clicked") {
    attributes["search.document_id"] = event.documentId;
    if (typeof event.position === "number") attributes["search.position"] = event.position;
  }
  if (event.event === "search_converted") {
    attributes["search.document_id"] = event.documentId;
    if (event.conversionType) attributes["search.conversion_type"] = event.conversionType;
    if (typeof event.value === "number") attributes["search.conversion_value"] = event.value;
    if (event.currency) attributes["search.currency"] = event.currency;
  }
  if (event.event === "search_error") {
    if (event.errorCode) attributes["search.error_code"] = event.errorCode;
    if (typeof event.status === "number") attributes["search.status"] = event.status;
    attributes["search.error_message"] = event.message;
  }

  return attributes;
}

function resolveSpanName(
  event: SearchAnalyticsEvent,
  option?: string | ((event: SearchAnalyticsEvent) => string),
): string {
  if (typeof option === "function") return option(event);
  if (typeof option === "string" && option.trim()) return option;
  return `search.analytics.${event.event}`;
}

export function createOpenTelemetryAnalyticsProvider(
  options: OpenTelemetryAnalyticsProviderOptions,
): SearchAnalyticsProvider {
  const counter = options.meter?.createCounter(options.counterName ?? "search_analytics_events_total", {
    description: "Total number of search analytics events emitted by alternate-search",
  });
  const durationHistogram = options.meter?.createHistogram(
    options.durationHistogramName ?? "search_query_duration_ms",
    {
      description: "Search query duration reported by search_performed events",
      unit: "ms",
    },
  );

  return {
    async track(event) {
      const attributes = toTelemetryAttributes(event, {
        ...(options.serviceName ? { "service.name": options.serviceName } : {}),
        ...(options.staticAttributes ?? {}),
      });

      counter?.add(1, attributes);
      if (event.event === "search_performed" && typeof event.took === "number") {
        durationHistogram?.record(event.took, attributes);
      }

      if (!options.tracer) return;

      const span = options.tracer.startSpan(resolveSpanName(event, options.spanName), {
        attributes,
      });
      try {
        span.addEvent?.("search.analytics", attributes as Record<string, unknown>);
        if (event.event === "search_error") {
          span.recordException?.(new Error(event.message));
        }
      } finally {
        span.end();
      }
    },
  };
}

export function createPostHogAnalyticsProvider(
  options: PostHogAnalyticsProviderOptions,
): SearchAnalyticsProvider {
  return {
    async track(event) {
      const fetchImpl = getFetch(options.fetch);
      const response = await fetchImpl(`${normalizeHost(options.host ?? "https://us.i.posthog.com")}/capture/`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...options.headers,
        },
        body: JSON.stringify({
          api_key: options.apiKey,
          event: event.event,
          distinct_id: options.distinctId?.(event) ?? getDistinctId(event),
          properties: toProperties(event),
          timestamp: event.timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error(`PostHog analytics request failed with status ${response.status}`);
      }
    },
  };
}

export function createSegmentAnalyticsProvider(
  options: SegmentAnalyticsProviderOptions,
): SearchAnalyticsProvider {
  return {
    async track(event) {
      const fetchImpl = getFetch(options.fetch);
      const response = await fetchImpl(`${normalizeHost(options.host ?? "https://api.segment.io/v1")}/track`, {
        method: "POST",
        headers: {
          authorization: `Basic ${encodeBase64(`${options.writeKey}:`)}`,
          "content-type": "application/json",
          ...options.headers,
        },
        body: JSON.stringify({
          event: getSegmentName(event),
          userId: event.userId,
          anonymousId: options.anonymousId?.(event) ?? event.requestId ?? getDistinctId(event),
          properties: toProperties(event),
          timestamp: event.timestamp,
          context: {
            traits: {
              tenantId: event.tenantId,
              backend: event.backend,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Segment analytics request failed with status ${response.status}`);
      }
    },
  };
}

export function createFileAnalyticsProvider(
  options: FileAnalyticsProviderOptions,
): SearchAnalyticsProvider {
  return {
    async track(event) {
      const writer = await getWriter(options);
      await writer.append(`${JSON.stringify(event)}\n`);
    },
  };
}

export function createCsvAnalyticsProvider(
  options: CsvAnalyticsProviderOptions,
): SearchAnalyticsProvider {
  let headerWritten = false;
  const columns = getCsvColumns(options.columns);
  const delimiter = options.delimiter ?? ",";
  const includeHeader = options.includeHeader ?? true;

  return {
    async track(event) {
      const writer = await getWriter(options);
      if (includeHeader && !headerWritten) {
        await writer.append(`${columns.join(delimiter)}\n`);
        headerWritten = true;
      }
      await writer.append(toCsvLine(event, columns, delimiter));
    },
  };
}

export function createAnalyticsBridge(
  providers: SearchAnalyticsProvider[] = [],
): SearchAnalyticsBridge {
  return {
    async track(event) {
      if (providers.length === 0) return;
      await dispatch(providers, event);
    },

    async trackPerformed(event) {
      await this.track(withBaseEvent<SearchPerformedAnalyticsEvent>({
        ...event,
        event: "search_performed",
      }));
    },

    async trackClick(event) {
      await this.track(withBaseEvent<SearchClickAnalyticsEvent>({
        ...event,
        event: "search_clicked",
      }));
    },

    async trackConversion(event) {
      await this.track(withBaseEvent<SearchConversionAnalyticsEvent>({
        ...event,
        event: "search_converted",
      }));
    },

    async trackError(event) {
      await this.track(withBaseEvent<SearchErrorAnalyticsEvent>({
        ...event,
        event: "search_error",
      }));
    },
  };
}
