"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDepthLimitPlugin = void 0;
var depth_limit_1 = require("@graphile/depth-limit");
var useDepthLimitPlugin = function () {
    var _a;
    return (0, depth_limit_1.useDepthLimit)({
        maxDepth: Number((_a = process.env.GQL_MAX_DEPTH) !== null && _a !== void 0 ? _a : 8),
        ignoreIntrospection: true
    });
};
exports.useDepthLimitPlugin = useDepthLimitPlugin;
