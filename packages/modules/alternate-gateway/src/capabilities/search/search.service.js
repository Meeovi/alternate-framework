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
exports.SearchCapabilityService = void 0;
var search_validators_1 = require("./search.validators");
var search_errors_1 = require("./search.errors");
var DEFAULT_TIMEOUT_MS = 15000;
var SearchCapabilityService = /** @class */ (function () {
    function SearchCapabilityService(adapter, deps) {
        if (deps === void 0) { deps = {}; }
        var _a;
        this.adapter = adapter;
        this.deps = deps;
        this.timeoutMs = (_a = deps.timeoutMs) !== null && _a !== void 0 ? _a : DEFAULT_TIMEOUT_MS;
    }
    SearchCapabilityService.prototype.search = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var startedAt, parsedInput, providerResult, normalizedProviderResult, totalPages, output, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startedAt = Date.now();
                        parsedInput = (0, search_validators_1.parseSearchInput)(input);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        this.assertSearchSafety(parsedInput);
                        return [4 /*yield*/, ((_a = this.deps.acl) === null || _a === void 0 ? void 0 : _a.assertAccess(parsedInput.actorId, 'search', 'read'))];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, ((_b = this.deps.rateLimiter) === null || _b === void 0 ? void 0 : _b.consume("search:".concat(parsedInput.actorId)))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, this.withTimeout(this.adapter.search(parsedInput))];
                    case 4:
                        providerResult = _c.sent();
                        normalizedProviderResult = (0, search_validators_1.parseNormalizedSearchProviderResult)(providerResult);
                        totalPages = Math.ceil(normalizedProviderResult.totalResults / parsedInput.pageSize);
                        output = (0, search_validators_1.parseSearchOutput)({
                            items: normalizedProviderResult.items,
                            pagination: {
                                page: parsedInput.page,
                                pageSize: parsedInput.pageSize,
                                totalResults: normalizedProviderResult.totalResults,
                                totalPages: totalPages,
                            },
                        });
                        this.recordSuccess('search', parsedInput.correlationId, startedAt);
                        return [2 /*return*/, output];
                    case 5:
                        error_1 = _c.sent();
                        this.recordFailure('search', parsedInput.correlationId, startedAt, error_1);
                        throw (0, search_errors_1.toSearchCapabilityError)(error_1, 'SEARCH_UPSTREAM_FAILURE', 'Search failed');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SearchCapabilityService.prototype.assertSearchSafety = function (input) {
        if (/[*%]{2,}|\*/.test(input.query)) {
            throw (0, search_errors_1.toSearchCapabilityError)(new Error('Wildcard queries are not allowed'), 'SEARCH_INVALID_QUERY', 'Invalid search query');
        }
    };
    SearchCapabilityService.prototype.withTimeout = function (promise) {
        return __awaiter(this, void 0, void 0, function () {
            var timeoutPromise;
            var _this = this;
            return __generator(this, function (_a) {
                timeoutPromise = new Promise(function (_, reject) {
                    var timeoutId = setTimeout(function () {
                        clearTimeout(timeoutId);
                        reject(new Error('Search provider call timed out'));
                    }, _this.timeoutMs);
                });
                return [2 /*return*/, Promise.race([promise, timeoutPromise])];
            });
        });
    };
    SearchCapabilityService.prototype.recordSuccess = function (methodName, correlationId, startedAt) {
        var _a, _b, _c;
        var latency = Date.now() - startedAt;
        (_a = this.deps.logger) === null || _a === void 0 ? void 0 : _a.info('search capability succeeded', {
            capability: 'search',
            methodName: methodName,
            correlationId: correlationId,
            providerName: this.adapter.providerName,
            latency: latency,
            success: true,
        });
        (_b = this.deps.metrics) === null || _b === void 0 ? void 0 : _b.increment('capability.search.success', { methodName: methodName, provider: this.adapter.providerName });
        (_c = this.deps.metrics) === null || _c === void 0 ? void 0 : _c.timing('capability.search.latency_ms', latency, { methodName: methodName, provider: this.adapter.providerName });
    };
    SearchCapabilityService.prototype.recordFailure = function (methodName, correlationId, startedAt, error) {
        var _a, _b, _c;
        var latency = Date.now() - startedAt;
        (_a = this.deps.logger) === null || _a === void 0 ? void 0 : _a.error('search capability failed', {
            capability: 'search',
            methodName: methodName,
            correlationId: correlationId,
            providerName: this.adapter.providerName,
            latency: latency,
            success: false,
            errorMessage: error instanceof Error ? error.message : 'unknown-error',
        });
        (_b = this.deps.metrics) === null || _b === void 0 ? void 0 : _b.increment('capability.search.error', { methodName: methodName, provider: this.adapter.providerName });
        (_c = this.deps.metrics) === null || _c === void 0 ? void 0 : _c.timing('capability.search.latency_ms', latency, { methodName: methodName, provider: this.adapter.providerName });
    };
    return SearchCapabilityService;
}());
exports.SearchCapabilityService = SearchCapabilityService;
