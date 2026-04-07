"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDisableIntrospectionPlugin = void 0;
var graphql_1 = require("graphql");
var useDisableIntrospectionPlugin = function () { return ({
    onValidate: function (_a) {
        var addValidationRule = _a.addValidationRule;
        if (process.env.NODE_ENV === "production") {
            addValidationRule(graphql_1.NoSchemaIntrospectionCustomRule);
        }
    }
}); };
exports.useDisableIntrospectionPlugin = useDisableIntrospectionPlugin;
