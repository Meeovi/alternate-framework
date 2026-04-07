"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSearchInput = parseSearchInput;
exports.parseSearchOutput = parseSearchOutput;
exports.parseNormalizedSearchProviderResult = parseNormalizedSearchProviderResult;
var search_schemas_1 = require("../../contracts/search/search.schemas");
function parseSearchInput(input) {
    return search_schemas_1.SearchInputSchema.parse(input);
}
function parseSearchOutput(output) {
    return search_schemas_1.SearchOutputSchema.parse(output);
}
function parseNormalizedSearchProviderResult(result) {
    return search_schemas_1.NormalizedSearchProviderResultSchema.parse(result);
}
