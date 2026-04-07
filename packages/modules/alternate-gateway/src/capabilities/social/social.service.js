"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialCapabilityService = void 0;
var social_validators_1 = require("./social.validators");
var social_errors_1 = require("./social.errors");
var DEFAULT_TIMEOUT_MS = 15000;
var SocialCapabilityService = /** @class */ (function () {
    function SocialCapabilityService(adapter, deps) {
        if (deps === void 0) { deps = {}; }
        var _a;
        this.adapter = adapter;
        this.deps = deps;
        this.timeoutMs = (_a = deps.timeoutMs) !== null && _a !== void 0 ? _a : DEFAULT_TIMEOUT_MS;
    }
    SocialCapabilityService.prototype.follow = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var startedAt, parsedInput, providerResult, output, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startedAt = Date.now();
                        parsedInput = (0, social_validators_1.parseFollowInput)(input);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, ((_a = this.deps.acl) === null || _a === void 0 ? void 0 : _a.assertAccess(parsedInput.actorId, "social:user:".concat(parsedInput.targetId), 'follow'))];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, ((_b = this.deps.rateLimiter) === null || _b === void 0 ? void 0 : _b.consume("social:follow:".concat(parsedInput.actorId)))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, this.withTimeout(this.adapter.follow(parsedInput))];
                    case 4:
                        providerResult = _c.sent();
                        output = (0, social_validators_1.parseFollowOutput)(providerResult);
                        this.recordSuccess('follow', parsedInput.correlationId, startedAt);
                        return [2 /*return*/, output];
                    case 5:
                        error_1 = _c.sent();
                        this.recordFailure('follow', parsedInput.correlationId, startedAt, error_1);
                        throw (0, social_errors_1.toSocialCapabilityError)(error_1, 'SOCIAL_UPSTREAM_FAILURE', 'Failed to follow user');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SocialCapabilityService.prototype.unfollow = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var startedAt, parsedInput, providerResult, output, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startedAt = Date.now();
                        parsedInput = (0, social_validators_1.parseUnfollowInput)(input);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, ((_a = this.deps.acl) === null || _a === void 0 ? void 0 : _a.assertAccess(parsedInput.actorId, "social:user:".concat(parsedInput.targetId), 'unfollow'))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.withTimeout(this.adapter.unfollow(parsedInput))];
                    case 3:
                        providerResult = _b.sent();
                        output = (0, social_validators_1.parseUnfollowOutput)(providerResult);
                        this.recordSuccess('unfollow', parsedInput.correlationId, startedAt);
                        return [2 /*return*/, output];
                    case 4:
                        error_2 = _b.sent();
                        this.recordFailure('unfollow', parsedInput.correlationId, startedAt, error_2);
                        throw (0, social_errors_1.toSocialCapabilityError)(error_2, 'SOCIAL_UPSTREAM_FAILURE', 'Failed to unfollow user');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SocialCapabilityService.prototype.getFeed = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var startedAt, parsedInput, providerResult, totalPages, output, error_3;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startedAt = Date.now();
                        parsedInput = (0, social_validators_1.parseGetFeedInput)(input);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, ((_a = this.deps.acl) === null || _a === void 0 ? void 0 : _a.assertAccess(parsedInput.actorId, 'social:feed', 'read'))];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, ((_b = this.deps.rateLimiter) === null || _b === void 0 ? void 0 : _b.consume("social:feed:".concat(parsedInput.actorId)))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, this.withTimeout(this.adapter.getFeed(parsedInput))];
                    case 4:
                        providerResult = _c.sent();
                        totalPages = Math.ceil(providerResult.totalResults / parsedInput.pageSize);
                        output = (0, social_validators_1.parseGetFeedOutput)({
                            posts: providerResult.posts,
                            page: parsedInput.page,
                            pageSize: parsedInput.pageSize,
                            totalResults: providerResult.totalResults,
                            totalPages: totalPages,
                        });
                        this.recordSuccess('getFeed', parsedInput.correlationId, startedAt);
                        return [2 /*return*/, output];
                    case 5:
                        error_3 = _c.sent();
                        this.recordFailure('getFeed', parsedInput.correlationId, startedAt, error_3);
                        throw (0, social_errors_1.toSocialCapabilityError)(error_3, 'SOCIAL_UPSTREAM_FAILURE', 'Failed to fetch feed');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SocialCapabilityService.prototype.createPost = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var startedAt, parsedInput, providerResult, output, error_4;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startedAt = Date.now();
                        parsedInput = (0, social_validators_1.parseCreatePostInput)(input);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, ((_a = this.deps.acl) === null || _a === void 0 ? void 0 : _a.assertAccess(parsedInput.actorId, 'social:post', 'write'))];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, ((_b = this.deps.rateLimiter) === null || _b === void 0 ? void 0 : _b.consume("social:createPost:".concat(parsedInput.actorId)))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, this.withTimeout(this.adapter.createPost(parsedInput))];
                    case 4:
                        providerResult = _c.sent();
                        output = (0, social_validators_1.parseCreatePostOutput)(providerResult);
                        this.recordSuccess('createPost', parsedInput.correlationId, startedAt);
                        return [2 /*return*/, output];
                    case 5:
                        error_4 = _c.sent();
                        this.recordFailure('createPost', parsedInput.correlationId, startedAt, error_4);
                        throw (0, social_errors_1.toSocialCapabilityError)(error_4, 'SOCIAL_UPSTREAM_FAILURE', 'Failed to create post');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SocialCapabilityService.prototype.withTimeout = function (promise) {
        return __awaiter(this, void 0, void 0, function () {
            var timeoutPromise;
            var _this = this;
            return __generator(this, function (_a) {
                timeoutPromise = new Promise(function (_, reject) {
                    var timeoutId = setTimeout(function () {
                        clearTimeout(timeoutId);
                        reject(new Error('Social provider call timed out'));
                    }, _this.timeoutMs);
                });
                return [2 /*return*/, Promise.race([promise, timeoutPromise])];
            });
        });
    };
    SocialCapabilityService.prototype.recordSuccess = function (methodName, correlationId, startedAt) {
        var _a, _b, _c;
        var latency = Date.now() - startedAt;
        (_a = this.deps.logger) === null || _a === void 0 ? void 0 : _a.info('social capability succeeded', {
            capability: 'social',
            methodName: methodName,
            correlationId: correlationId,
            providerName: this.adapter.providerName,
            latency: latency,
            success: true,
        });
        (_b = this.deps.metrics) === null || _b === void 0 ? void 0 : _b.increment('capability.social.success', { methodName: methodName, provider: this.adapter.providerName });
        (_c = this.deps.metrics) === null || _c === void 0 ? void 0 : _c.timing('capability.social.latency_ms', latency, { methodName: methodName, provider: this.adapter.providerName });
    };
    SocialCapabilityService.prototype.recordFailure = function (methodName, correlationId, startedAt, error) {
        var _a, _b, _c;
        var latency = Date.now() - startedAt;
        (_a = this.deps.logger) === null || _a === void 0 ? void 0 : _a.error('social capability failed', {
            capability: 'social',
            methodName: methodName,
            correlationId: correlationId,
            providerName: this.adapter.providerName,
            latency: latency,
            success: false,
            errorMessage: error instanceof Error ? error.message : 'unknown-error',
        });
        (_b = this.deps.metrics) === null || _b === void 0 ? void 0 : _b.increment('capability.social.error', { methodName: methodName, provider: this.adapter.providerName });
        (_c = this.deps.metrics) === null || _c === void 0 ? void 0 : _c.timing('capability.social.latency_ms', latency, { methodName: methodName, provider: this.adapter.providerName });
    };
    return SocialCapabilityService;
}());
exports.SocialCapabilityService = SocialCapabilityService;
