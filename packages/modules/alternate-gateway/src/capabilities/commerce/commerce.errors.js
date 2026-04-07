"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCommerceCapabilityError = toCommerceCapabilityError;
var commerce_dto_1 = require("../../contracts/commerce/commerce.dto");
var DEFAULT_STATUS_BY_CODE = {
    COMMERCE_NOT_FOUND: 404,
    COMMERCE_FORBIDDEN: 403,
    COMMERCE_INVALID_INPUT: 400,
    COMMERCE_RATE_LIMITED: 429,
    COMMERCE_TIMEOUT: 504,
    COMMERCE_UPSTREAM_FAILURE: 502,
    COMMERCE_VALIDATION_FAILED: 400,
};
function toCommerceCapabilityError(error, fallbackCode, fallbackMessage) {
    if (error instanceof commerce_dto_1.CommerceContractError) {
        return error;
    }
    var maybeError = error;
    if ((maybeError === null || maybeError === void 0 ? void 0 : maybeError.name) === 'ZodError') {
        return new commerce_dto_1.CommerceContractError('COMMERCE_VALIDATION_FAILED', 'Invalid commerce payload', 400);
    }
    if (((maybeError === null || maybeError === void 0 ? void 0 : maybeError.message) || '').toLowerCase().includes('timed out')) {
        return new commerce_dto_1.CommerceContractError('COMMERCE_TIMEOUT', 'Commerce provider timed out', 504);
    }
    return new commerce_dto_1.CommerceContractError(fallbackCode, fallbackMessage, (maybeError === null || maybeError === void 0 ? void 0 : maybeError.statusCode) || DEFAULT_STATUS_BY_CODE[fallbackCode]);
}
