"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLoginInput = parseLoginInput;
exports.parseLoginOutput = parseLoginOutput;
exports.parseRefreshInput = parseRefreshInput;
exports.parseRefreshOutput = parseRefreshOutput;
exports.parseValidateAccessTokenInput = parseValidateAccessTokenInput;
exports.parseValidatedUserOutput = parseValidatedUserOutput;
exports.parseLogoutInput = parseLogoutInput;
exports.parseLogoutOutput = parseLogoutOutput;
var auth_schema_1 = require("../../contracts/auth/auth.schema");
function parseLoginInput(input) {
    return auth_schema_1.LoginInputSchema.parse(input);
}
function parseLoginOutput(output) {
    return auth_schema_1.LoginOutputSchema.parse(output);
}
function parseRefreshInput(input) {
    return auth_schema_1.RefreshInputSchema.parse(input);
}
function parseRefreshOutput(output) {
    return auth_schema_1.RefreshOutputSchema.parse(output);
}
function parseValidateAccessTokenInput(input) {
    return auth_schema_1.ValidateAccessTokenInputSchema.parse(input);
}
function parseValidatedUserOutput(output) {
    return auth_schema_1.ValidatedUserSchema.parse(output);
}
function parseLogoutInput(input) {
    return auth_schema_1.LogoutInputSchema.parse(input);
}
function parseLogoutOutput(output) {
    return auth_schema_1.LogoutOutputSchema.parse(output);
}
