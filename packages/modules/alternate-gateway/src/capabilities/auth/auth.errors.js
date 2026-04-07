"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAuthCapabilityError = toAuthCapabilityError;
var auth_dto_1 = require("../../contracts/auth/auth.dto");
var DEFAULT_STATUS_BY_CODE = {
    AUTH_INVALID_CREDENTIALS: 401,
    AUTH_INVALID_TOKEN: 401,
    AUTH_EXPIRED_TOKEN: 401,
    AUTH_FORBIDDEN: 403,
    AUTH_RATE_LIMITED: 429,
    AUTH_TIMEOUT: 504,
    AUTH_UPSTREAM_FAILURE: 502,
    AUTH_VALIDATION_FAILED: 400,
};
function toAuthCapabilityError(error, fallbackCode, fallbackMessage) {
    if (error instanceof auth_dto_1.AuthContractError) {
        return error;
    }
    var maybeError = error;
    if ((maybeError === null || maybeError === void 0 ? void 0 : maybeError.name) === 'ZodError') {
        return new auth_dto_1.AuthContractError('AUTH_VALIDATION_FAILED', 'Invalid auth payload', 400);
    }
    if ((maybeError === null || maybeError === void 0 ? void 0 : maybeError.code) === 'ETIMEDOUT' || (maybeError === null || maybeError === void 0 ? void 0 : maybeError.code) === 'ABORT_ERR') {
        return new auth_dto_1.AuthContractError('AUTH_TIMEOUT', 'Auth provider timed out', 504);
    }
    if (fallbackCode === 'AUTH_INVALID_CREDENTIALS') {
        return new auth_dto_1.AuthContractError(fallbackCode, 'Invalid credentials', DEFAULT_STATUS_BY_CODE[fallbackCode]);
    }
    return new auth_dto_1.AuthContractError(fallbackCode, fallbackMessage, (maybeError === null || maybeError === void 0 ? void 0 : maybeError.statusCode) || DEFAULT_STATUS_BY_CODE[fallbackCode]);
}
