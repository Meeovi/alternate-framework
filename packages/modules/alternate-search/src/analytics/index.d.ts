import type { SearchAnalyticsEvent, SearchAnalyticsProvider, SearchClickAnalyticsEvent, SearchConversionAnalyticsEvent, SearchErrorAnalyticsEvent, SearchPerformedAnalyticsEvent } from "../core/types";
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
    startSpan(name: string, options?: {
        attributes?: Record<string, unknown>;
    }): OpenTelemetrySpan;
};
export type OpenTelemetryCounter = {
    add(value: number, attributes?: Record<string, unknown>): void;
};
export type OpenTelemetryHistogram = {
    record(value: number, attributes?: Record<string, unknown>): void;
};
export type OpenTelemetryMeter = {
    createCounter(name: string, options?: {
        description?: string;
        unit?: string;
    }): OpenTelemetryCounter;
    createHistogram(name: string, options?: {
        description?: string;
        unit?: string;
    }): OpenTelemetryHistogram;
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
export declare function createOpenTelemetryAnalyticsProvider(options: OpenTelemetryAnalyticsProviderOptions): SearchAnalyticsProvider;
export declare function createPostHogAnalyticsProvider(options: PostHogAnalyticsProviderOptions): SearchAnalyticsProvider;
export declare function createSegmentAnalyticsProvider(options: SegmentAnalyticsProviderOptions): SearchAnalyticsProvider;
export declare function createFileAnalyticsProvider(options: FileAnalyticsProviderOptions): SearchAnalyticsProvider;
export declare function createCsvAnalyticsProvider(options: CsvAnalyticsProviderOptions): SearchAnalyticsProvider;
export declare function createAnalyticsBridge(providers?: SearchAnalyticsProvider[]): SearchAnalyticsBridge;
