"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCostLimitPlugin = void 0;
var useCostLimitPlugin = function () { return ({
    onParse: function () {
        return function (_a) {
            var _b;
            var params = _a.params, setResult = _a.setResult;
            var source = typeof params.source === "string" ? params.source : params.source.body;
            var maxCost = Number((_b = process.env.GQL_MAX_COST) !== null && _b !== void 0 ? _b : 3000);
            var estimatedCost = source.length;
            if (estimatedCost > maxCost) {
                setResult({ errors: [new Error("Query cost limit exceeded")] });
            }
        };
    }
}); };
exports.useCostLimitPlugin = useCostLimitPlugin;
