"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePersistedQueriesPlugin = void 0;
var plugin_apq_1 = require("@graphql-yoga/plugin-apq");
var store = new Map();
var usePersistedQueriesPlugin = function () {
    return (0, plugin_apq_1.useAPQ)({
        store: store
    });
};
exports.usePersistedQueriesPlugin = usePersistedQueriesPlugin;
