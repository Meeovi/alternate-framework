"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listsMeshSource = void 0;
var listsMeshSource = function () {
    var _a;
    return ({
        name: "lists",
        handler: "graphql",
        endpoint: (_a = process.env.LISTS_GRAPHQL_URL) !== null && _a !== void 0 ? _a : "http://localhost:4105/graphql"
    });
};
exports.listsMeshSource = listsMeshSource;
