"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useResponseCachePlugin = void 0;
var plugin_response_cache_1 = require("@graphql-yoga/plugin-response-cache");
var cache = (0, plugin_response_cache_1.createInMemoryCache)();
var useResponseCachePlugin = function () {
    var _a;
    return (0, plugin_response_cache_1.useResponseCache)({
        cache: cache,
        session: function (request) { var _a; return (_a = request.headers.get("x-session-id")) !== null && _a !== void 0 ? _a : "anonymous"; },
        ttl: Number((_a = process.env.GQL_RESPONSE_CACHE_TTL) !== null && _a !== void 0 ? _a : 30000)
    });
};
exports.useResponseCachePlugin = useResponseCachePlugin;
