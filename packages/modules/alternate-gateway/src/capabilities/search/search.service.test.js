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
var vitest_1 = require("vitest");
var search_service_1 = require("./search.service");
function createSearchAdapter() {
    var _this = this;
    return {
        providerName: 'test-search',
        search: vitest_1.vi.fn(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ({
                        items: [
                            {
                                id: 'result-1',
                                title: 'Result 1',
                                summary: 'Summary',
                                url: 'https://example.com/r/1',
                                score: 1,
                            },
                        ],
                        totalResults: 9,
                    })];
            });
        }); }),
    };
}
(0, vitest_1.describe)('SearchCapabilityService', function () {
    (0, vitest_1.it)('rejects wildcard queries before adapter execution', function () { return __awaiter(void 0, void 0, void 0, function () {
        var adapter, service;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    adapter = createSearchAdapter();
                    service = new search_service_1.SearchCapabilityService(adapter);
                    return [4 /*yield*/, (0, vitest_1.expect)(service.search({
                            query: 'phone*',
                            page: 1,
                            pageSize: 5,
                            correlationId: 'corr-12345',
                            actorId: '9f1d50e0-9caa-4f9f-b8d2-4128e1efa8a3',
                            filters: [],
                            sort: [],
                        })).rejects.toMatchObject({
                            name: 'SearchContractError',
                            code: 'SEARCH_INVALID_QUERY',
                        })];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(adapter.search).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('normalizes pagination metadata from provider totals', function () { return __awaiter(void 0, void 0, void 0, function () {
        var adapter, service, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    adapter = createSearchAdapter();
                    service = new search_service_1.SearchCapabilityService(adapter);
                    return [4 /*yield*/, service.search({
                            query: 'phone',
                            page: 2,
                            pageSize: 4,
                            correlationId: 'corr-12345',
                            actorId: '9f1d50e0-9caa-4f9f-b8d2-4128e1efa8a3',
                            filters: [],
                            sort: [],
                        })];
                case 1:
                    output = _a.sent();
                    (0, vitest_1.expect)(output.pagination.totalPages).toBe(3);
                    (0, vitest_1.expect)(output.pagination.totalResults).toBe(9);
                    (0, vitest_1.expect)(output.pagination.page).toBe(2);
                    return [2 /*return*/];
            }
        });
    }); });
});
