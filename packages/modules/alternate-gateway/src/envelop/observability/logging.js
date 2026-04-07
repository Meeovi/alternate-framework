"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRequestLoggingPlugin = void 0;
var useRequestLoggingPlugin = function () { return ({
    onRequest: function (_a) {
        var _b;
        var request = _a.request;
        var requestId = (_b = request.headers.get("x-request-id")) !== null && _b !== void 0 ? _b : "missing";
        console.log("[gateway] request", {
            requestId: requestId,
            method: request.method,
            path: new URL(request.url).pathname
        });
    }
}); };
exports.useRequestLoggingPlugin = useRequestLoggingPlugin;
