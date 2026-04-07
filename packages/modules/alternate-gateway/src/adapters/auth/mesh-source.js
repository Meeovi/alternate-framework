"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMeshSource = void 0;
var authMeshSource = function () {
    var _a;
    return ({
        name: "auth",
        handler: "graphql",
        endpoint: (_a = process.env.AUTH_GRAPHQL_URL) !== null && _a !== void 0 ? _a : "http://localhost:4101/graphql"
    });
};
exports.authMeshSource = authMeshSource;
