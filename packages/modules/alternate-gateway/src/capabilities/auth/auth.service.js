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
exports.AuthCapabilityService = void 0;
var validators_1 = require("./validators");
var auth_errors_1 = require("./auth.errors");
var DEFAULT_TIMEOUT_MS = 15000;
var AuthCapabilityService = /** @class */ (function () {
    function AuthCapabilityService(adapter, deps) {
        if (deps === void 0) { deps = {}; }
        var _a;
        this.adapter = adapter;
        this.deps = deps;
        this.timeoutMs = (_a = deps.timeoutMs) !== null && _a !== void 0 ? _a : DEFAULT_TIMEOUT_MS;
    }
    AuthCapabilityService.prototype.login = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var startedAt, parsedInput, providerResponse, output, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startedAt = Date.now();
                        parsedInput = (0, validators_1.parseLoginInput)(input);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, ((_a = this.deps.rateLimiter) === null || _a === void 0 ? void 0 : _a.consume("auth:login:".concat(parsedInput.email.toLowerCase())))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.withTimeout(this.adapter.login(parsedInput))];
                    case 3:
                        providerResponse = _b.sent();
                        output = (0, validators_1.parseLoginOutput)({
                            accessToken: providerResponse.accessToken,
                            refreshToken: providerResponse.refreshToken,
                            tokenType: providerResponse.tokenType,
                            expiresAtIso: providerResponse.expiresAtIso,
                            user: {
                                id: providerResponse.user.userId,
                                email: providerResponse.user.email,
                                displayName: providerResponse.user.displayName,
                                roles: providerResponse.user.roles,
                                isEmailVerified: providerResponse.user.emailVerified,
                            },
                        });
                        this.recordSuccess('login', parsedInput.correlationId, startedAt);
                        return [2 /*return*/, output];
                    case 4:
                        error_1 = _b.sent();
                        this.recordFailure('login', parsedInput.correlationId, startedAt, error_1);
                        throw (0, auth_errors_1.toAuthCapabilityError)(error_1, 'AUTH_INVALID_CREDENTIALS', 'Auth login failed');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AuthCapabilityService.prototype.refresh = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var startedAt, parsedInput, providerResponse, output, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startedAt = Date.now();
                        parsedInput = (0, validators_1.parseRefreshInput)(input);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, ((_a = this.deps.rateLimiter) === null || _a === void 0 ? void 0 : _a.consume("auth:refresh:".concat(parsedInput.correlationId)))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.withTimeout(this.adapter.refresh(parsedInput))];
                    case 3:
                        providerResponse = _b.sent();
                        output = (0, validators_1.parseRefreshOutput)({
                            accessToken: providerResponse.accessToken,
                            refreshToken: providerResponse.refreshToken,
                            tokenType: providerResponse.tokenType,
                            expiresAtIso: providerResponse.expiresAtIso,
                        });
                        this.recordSuccess('refresh', parsedInput.correlationId, startedAt);
                        return [2 /*return*/, output];
                    case 4:
                        error_2 = _b.sent();
                        this.recordFailure('refresh', parsedInput.correlationId, startedAt, error_2);
                        throw (0, auth_errors_1.toAuthCapabilityError)(error_2, 'AUTH_INVALID_TOKEN', 'Auth refresh failed');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AuthCapabilityService.prototype.validateAccessToken = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var startedAt, parsedInput, providerResponse, output, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startedAt = Date.now();
                        parsedInput = (0, validators_1.parseValidateAccessTokenInput)(input);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.withTimeout(this.adapter.introspectAccessToken(parsedInput))];
                    case 2:
                        providerResponse = _a.sent();
                        output = (0, validators_1.parseValidatedUserOutput)({
                            user: {
                                id: providerResponse.userId,
                                email: providerResponse.email,
                                displayName: providerResponse.displayName,
                                roles: providerResponse.roles,
                                isEmailVerified: providerResponse.emailVerified,
                            },
                        });
                        this.recordSuccess('validateAccessToken', parsedInput.correlationId, startedAt);
                        return [2 /*return*/, output];
                    case 3:
                        error_3 = _a.sent();
                        this.recordFailure('validateAccessToken', parsedInput.correlationId, startedAt, error_3);
                        throw (0, auth_errors_1.toAuthCapabilityError)(error_3, 'AUTH_INVALID_TOKEN', 'Auth token validation failed');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AuthCapabilityService.prototype.logout = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var startedAt, parsedInput, providerResponse, output, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startedAt = Date.now();
                        parsedInput = (0, validators_1.parseLogoutInput)(input);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.withTimeout(this.adapter.revokeAccessToken(parsedInput))];
                    case 2:
                        providerResponse = _a.sent();
                        output = (0, validators_1.parseLogoutOutput)({ revoked: providerResponse.revoked });
                        this.recordSuccess('logout', parsedInput.correlationId, startedAt);
                        return [2 /*return*/, output];
                    case 3:
                        error_4 = _a.sent();
                        this.recordFailure('logout', parsedInput.correlationId, startedAt, error_4);
                        throw (0, auth_errors_1.toAuthCapabilityError)(error_4, 'AUTH_UPSTREAM_FAILURE', 'Auth logout failed');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AuthCapabilityService.prototype.withTimeout = function (promise) {
        return __awaiter(this, void 0, void 0, function () {
            var timeoutPromise;
            var _this = this;
            return __generator(this, function (_a) {
                timeoutPromise = new Promise(function (_, reject) {
                    var timeoutId = setTimeout(function () {
                        clearTimeout(timeoutId);
                        reject(new Error('Auth provider call timed out'));
                    }, _this.timeoutMs);
                });
                return [2 /*return*/, Promise.race([promise, timeoutPromise])];
            });
        });
    };
    AuthCapabilityService.prototype.recordSuccess = function (methodName, correlationId, startedAt) {
        var _a, _b, _c;
        var latency = Date.now() - startedAt;
        (_a = this.deps.logger) === null || _a === void 0 ? void 0 : _a.info('auth capability succeeded', {
            capability: 'auth',
            methodName: methodName,
            correlationId: correlationId,
            providerName: this.adapter.providerName,
            latency: latency,
            success: true,
        });
        (_b = this.deps.metrics) === null || _b === void 0 ? void 0 : _b.increment('capability.auth.success', { methodName: methodName, provider: this.adapter.providerName });
        (_c = this.deps.metrics) === null || _c === void 0 ? void 0 : _c.timing('capability.auth.latency_ms', latency, { methodName: methodName, provider: this.adapter.providerName });
    };
    AuthCapabilityService.prototype.recordFailure = function (methodName, correlationId, startedAt, error) {
        var _a, _b, _c;
        var latency = Date.now() - startedAt;
        (_a = this.deps.logger) === null || _a === void 0 ? void 0 : _a.error('auth capability failed', {
            capability: 'auth',
            methodName: methodName,
            correlationId: correlationId,
            providerName: this.adapter.providerName,
            latency: latency,
            success: false,
            errorMessage: error instanceof Error ? error.message : 'unknown-error',
        });
        (_b = this.deps.metrics) === null || _b === void 0 ? void 0 : _b.increment('capability.auth.error', { methodName: methodName, provider: this.adapter.providerName });
        (_c = this.deps.metrics) === null || _c === void 0 ? void 0 : _c.timing('capability.auth.latency_ms', latency, { methodName: methodName, provider: this.adapter.providerName });
    };
    return AuthCapabilityService;
}());
exports.AuthCapabilityService = AuthCapabilityService;
