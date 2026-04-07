"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHiveUsagePlugin = void 0;
var useHiveUsagePlugin = function () { return ({
    onExecute: function () {
        return {
            onExecuteDone: function (_a) {
                var result = _a.result;
                if (process.env.HIVE_DEBUG === "true") {
                    var hasErrors = "errors" in result && Array.isArray(result.errors) && result.errors.length > 0;
                    console.log("[hive] usage report", { hasErrors: hasErrors });
                }
            }
        };
    }
}); };
exports.useHiveUsagePlugin = useHiveUsagePlugin;
