// For CLI usage
import {
    openTelemetrySetup
} from "@graphql-hive/gateway/opentelemetry/setup";
import {
    AsyncLocalStorageContextManager
} from "@opentelemetry/context-async-hooks";

openTelemetrySetup({
    resource: {
        serviceName: "m-framework-gateway",
        serviceVersion: "1.0.0",
    },
    contextManager: new AsyncLocalStorageContextManager(),
    traces: {
        console: true,
    },
});