"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerMeshSource = void 0;
var sellerMeshSource = function () {
    var _a;
    return ({
        name: "seller",
        handler: "graphql",
        endpoint: (_a = process.env.SELLER_GRAPHQL_URL) !== null && _a !== void 0 ? _a : "http://localhost:4107/graphql"
    });
};
exports.sellerMeshSource = sellerMeshSource;
