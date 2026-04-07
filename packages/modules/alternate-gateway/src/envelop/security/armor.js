"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGraphqlArmorPlugin = exports.graphqlArmorConfig = void 0;
exports.graphqlArmorConfig = {
    maxAliases: Number((_a = process.env.GQL_ARMOR_MAX_ALIASES) !== null && _a !== void 0 ? _a : 10),
    maxDepth: Number((_b = process.env.GQL_ARMOR_MAX_DEPTH) !== null && _b !== void 0 ? _b : 10),
    maxTokens: Number((_c = process.env.GQL_ARMOR_MAX_TOKENS) !== null && _c !== void 0 ? _c : 1000),
    maxDirectives: Number((_d = process.env.GQL_ARMOR_MAX_DIRECTIVES) !== null && _d !== void 0 ? _d : 20)
};
var useGraphqlArmorPlugin = function () { return ({
    onParse: function () {
        return function (_a) {
            var _b, _c;
            var params = _a.params, setResult = _a.setResult;
            var source = typeof params.source === "string" ? params.source : params.source.body;
            var aliasCount = ((_b = source.match(/\s+\w+\s*:/g)) !== null && _b !== void 0 ? _b : []).length;
            var directiveCount = ((_c = source.match(/@\w+/g)) !== null && _c !== void 0 ? _c : []).length;
            if (aliasCount > exports.graphqlArmorConfig.maxAliases || directiveCount > exports.graphqlArmorConfig.maxDirectives) {
                setResult({
                    errors: [
                        new Error("GraphQL Armor policy blocked this operation due to aliases/directives limit")
                    ]
                });
            }
        };
    }
}); };
exports.useGraphqlArmorPlugin = useGraphqlArmorPlugin;
