"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMeshSource = void 0;
var searchMeshSource = function () {
    var _a;
    return ({
        name: "search",
        handler: "graphql",
        endpoint: (_a = process.env.SEARCH_GRAPHQL_URL) !== null && _a !== void 0 ? _a : "http://localhost:4103/graphql"
    });
};
exports.searchMeshSource = searchMeshSource;
