"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSearchCapabilityError = toSearchCapabilityError;
var search_dto_1 = require("../../contracts/search/search.dto");
var DEFAULT_STATUS_BY_CODE = {
    SEARCH_INVALID_QUERY: 400,
    SEARCH_FORBIDDEN: 403,
    SEARCH_RATE_LIMITED: 429,
    SEARCH_TIMEOUT: 504,
    SEARCH_UPSTREAM_FAILURE: 502,
    SEARCH_VALIDATION_FAILED: 400,
};
function toSearchCapabilityError(error, fallbackCode, fallbackMessage) {
    if (error instanceof search_dto_1.SearchContractError) {
        return error;
    }
    var maybeError = error;
    if ((maybeError === null || maybeError === void 0 ? void 0 : maybeError.name) === 'ZodError') {
        return new search_dto_1.SearchContractError('SEARCH_VALIDATION_FAILED', 'Invalid search payload', 400);
    }
    if (((maybeError === null || maybeError === void 0 ? void 0 : maybeError.message) || '').toLowerCase().includes('timed out')) {
        return new search_dto_1.SearchContractError('SEARCH_TIMEOUT', 'Search provider timed out', 504);
    }
    return new search_dto_1.SearchContractError(fallbackCode, fallbackMessage, (maybeError === null || maybeError === void 0 ? void 0 : maybeError.statusCode) || DEFAULT_STATUS_BY_CODE[fallbackCode]);
}
