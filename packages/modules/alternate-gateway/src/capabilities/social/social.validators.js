"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFollowInput = parseFollowInput;
exports.parseFollowOutput = parseFollowOutput;
exports.parseUnfollowInput = parseUnfollowInput;
exports.parseUnfollowOutput = parseUnfollowOutput;
exports.parseGetFeedInput = parseGetFeedInput;
exports.parseGetFeedOutput = parseGetFeedOutput;
exports.parseCreatePostInput = parseCreatePostInput;
exports.parseCreatePostOutput = parseCreatePostOutput;
var social_schemas_1 = require("../../contracts/social/social.schemas");
function parseFollowInput(input) {
    return social_schemas_1.FollowInputSchema.parse(input);
}
function parseFollowOutput(output) {
    return social_schemas_1.FollowOutputSchema.parse(output);
}
function parseUnfollowInput(input) {
    return social_schemas_1.UnfollowInputSchema.parse(input);
}
function parseUnfollowOutput(output) {
    return social_schemas_1.UnfollowOutputSchema.parse(output);
}
function parseGetFeedInput(input) {
    return social_schemas_1.GetFeedInputSchema.parse(input);
}
function parseGetFeedOutput(output) {
    return social_schemas_1.GetFeedOutputSchema.parse(output);
}
function parseCreatePostInput(input) {
    return social_schemas_1.CreatePostInputSchema.parse(input);
}
function parseCreatePostOutput(output) {
    return social_schemas_1.CreatePostOutputSchema.parse(output);
}
