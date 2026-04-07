"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSocialCapabilityError = toSocialCapabilityError;
var social_dto_1 = require("../../contracts/social/social.dto");
var DEFAULT_STATUS_BY_CODE = {
    SOCIAL_NOT_FOUND: 404,
    SOCIAL_FORBIDDEN: 403,
    SOCIAL_INVALID_INPUT: 400,
    SOCIAL_RATE_LIMITED: 429,
    SOCIAL_TIMEOUT: 504,
    SOCIAL_UPSTREAM_FAILURE: 502,
    SOCIAL_VALIDATION_FAILED: 400,
};
function toSocialCapabilityError(error, fallbackCode, fallbackMessage) {
    if (error instanceof social_dto_1.SocialContractError) {
        return error;
    }
    var maybeError = error;
    if ((maybeError === null || maybeError === void 0 ? void 0 : maybeError.name) === 'ZodError') {
        return new social_dto_1.SocialContractError('SOCIAL_VALIDATION_FAILED', 'Invalid social payload', 400);
    }
    if (((maybeError === null || maybeError === void 0 ? void 0 : maybeError.message) || '').toLowerCase().includes('timed out')) {
        return new social_dto_1.SocialContractError('SOCIAL_TIMEOUT', 'Social provider timed out', 504);
    }
    return new social_dto_1.SocialContractError(fallbackCode, fallbackMessage, (maybeError === null || maybeError === void 0 ? void 0 : maybeError.statusCode) || DEFAULT_STATUS_BY_CODE[fallbackCode]);
}
