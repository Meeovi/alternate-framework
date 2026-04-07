"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMeshSources = void 0;
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var node_url_1 = require("node:url");
var mesh_source_1 = require("./app/adapters/auth/mesh-source");
var mesh_source_2 = require("./app/adapters/chat/mesh-source");
var mesh_source_3 = require("./app/adapters/commerce/mesh-source");
var mesh_source_4 = require("./app/adapters/lists/mesh-source");
var mesh_source_5 = require("./app/adapters/search/mesh-source");
var mesh_source_6 = require("./app/adapters/seller/mesh-source");
var mesh_source_7 = require("./app/adapters/social/mesh-source");
var load_base_app_env_1 = require("./app/utils/load-base-app-env");
var loadedBaseAppDir = (0, load_base_app_env_1.loadBaseAppEnv)();
if (loadedBaseAppDir) {
    console.info("[gateway] Loaded mesh env from base app: ".concat(loadedBaseAppDir));
}
var defaultHeaders = {
    "x-gateway": "meeovi-gateway"
};
var gatewayDir = (0, node_path_1.dirname)((0, node_url_1.fileURLToPath)(import.meta.url));
var repoRoot = (0, node_path_1.resolve)(gatewayDir, "..", "..");
var adapterPackagesDir = (0, node_path_1.join)(repoRoot, "packages", "adapters");
var extractRegexMatch = function (source, expression) {
    var _a;
    var match = source.match(expression);
    return (_a = match === null || match === void 0 ? void 0 : match[1]) !== null && _a !== void 0 ? _a : null;
};
var discoverExternalAdapterSources = function () {
    var _a, _b;
    if (!(0, node_fs_1.existsSync)(adapterPackagesDir)) {
        return [];
    }
    var sourceNames = new Set([
        "auth",
        "commerce",
        "search",
        "social",
        "lists",
        "chat",
        "seller"
    ]);
    var discovered = [];
    var entries = (0, node_fs_1.readdirSync)(adapterPackagesDir, { withFileTypes: true });
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var entry = entries_1[_i];
        if (!entry.isDirectory() || !entry.name.startsWith("adapter-")) {
            continue;
        }
        var adapterDir = (0, node_path_1.join)(adapterPackagesDir, entry.name);
        var meshSourcePath = (0, node_path_1.join)(adapterDir, "mesh-source.ts");
        if (!(0, node_fs_1.existsSync)(meshSourcePath)) {
            continue;
        }
        var meshSourceText = (0, node_fs_1.readFileSync)(meshSourcePath, "utf-8");
        var adapterId = entry.name.replace(/^adapter-/, "");
        var explicitName = extractRegexMatch(meshSourceText, /name\s*:\s*["'`]([^"'`]+)["'`]/);
        var sourceName = explicitName !== null && explicitName !== void 0 ? explicitName : adapterId;
        if (sourceNames.has(sourceName)) {
            continue;
        }
        var endpointEnv = extractRegexMatch(meshSourceText, /process\.env\.([A-Z0-9_]*GRAPHQL(?:_URL)?)/);
        var tokenEnv = extractRegexMatch(meshSourceText, /process\.env\.([A-Z0-9_]*TOKEN)/);
        var endpoint = (_a = (endpointEnv ? process.env[endpointEnv] : undefined)) !== null && _a !== void 0 ? _a : "http://localhost:4102/graphql";
        discovered.push({
            name: sourceName,
            handler: "graphql",
            endpoint: endpoint,
            headers: tokenEnv
                ? {
                    Authorization: "Bearer ".concat((_b = process.env[tokenEnv]) !== null && _b !== void 0 ? _b : "")
                }
                : undefined
        });
        sourceNames.add(sourceName);
    }
    return discovered;
};
var buildMeshSources = function () { return __spreadArray([
    (0, mesh_source_1.authMeshSource)(),
    (0, mesh_source_3.commerceMeshSource)(),
    (0, mesh_source_5.searchMeshSource)(),
    (0, mesh_source_7.socialMeshSource)(),
    (0, mesh_source_4.listsMeshSource)(),
    (0, mesh_source_2.chatMeshSource)(),
    (0, mesh_source_6.sellerMeshSource)()
], discoverExternalAdapterSources(), true).map(function (source) {
    var _a;
    return (__assign(__assign({}, source), { headers: __assign(__assign({}, defaultHeaders), ((_a = source.headers) !== null && _a !== void 0 ? _a : {})) }));
}); };
exports.buildMeshSources = buildMeshSources;
exports.default = {
    sources: (0, exports.buildMeshSources)()
};
