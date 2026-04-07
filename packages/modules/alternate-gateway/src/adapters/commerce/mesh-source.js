"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commerceMeshSource = void 0;
var commerceMeshSource = function () {
    var _a;
    return ({
        name: "commerce",
        handler: "graphql",
        endpoint: (_a = process.env.COMMERCE_GRAPHQL_URL) !== null && _a !== void 0 ? _a : "http://localhost:4102/graphql"
    });
};
exports.commerceMeshSource = commerceMeshSource;
