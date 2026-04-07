"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// For CLI usage
var setup_1 = require("@graphql-hive/gateway/opentelemetry/setup");
var context_async_hooks_1 = require("@opentelemetry/context-async-hooks");
(0, setup_1.openTelemetrySetup)({
    resource: {
        serviceName: "m-framework-gateway",
        serviceVersion: "1.0.0",
    },
    contextManager: new context_async_hooks_1.AsyncLocalStorageContextManager(),
    traces: {
        console: true,
    },
});
