"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialMeshSource = void 0;
var socialMeshSource = function () {
    var _a;
    return ({
        name: "social",
        handler: "graphql",
        endpoint: (_a = process.env.SOCIAL_GRAPHQL_URL) !== null && _a !== void 0 ? _a : "http://localhost:4104/graphql"
    });
};
exports.socialMeshSource = socialMeshSource;
