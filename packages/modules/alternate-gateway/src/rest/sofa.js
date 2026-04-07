"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSofaPlugin = void 0;
var plugin_sofa_1 = require("@graphql-yoga/plugin-sofa");
var useSofaPlugin = function (schema) {
    return (0, plugin_sofa_1.useSofa)({
        schema: schema,
        basePath: "/rest",
        ignore: ["_service", "_noop"],
        onRoute: function (info) {
            console.log("[sofa] ".concat(info.method.toUpperCase(), " ").concat(info.path));
        }
    });
};
exports.useSofaPlugin = useSofaPlugin;
