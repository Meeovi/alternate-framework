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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterModules = void 0;
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var node_url_1 = require("node:url");
var resolvers_1 = require("./auth/resolvers");
var resolvers_2 = require("./chat/resolvers");
var resolvers_3 = require("./commerce/resolvers");
var resolvers_4 = require("./lists/resolvers");
var resolvers_5 = require("./search/resolvers");
var resolvers_6 = require("./seller/resolvers");
var resolvers_7 = require("./social/resolvers");
var gatewayAdaptersDir = (0, node_path_1.dirname)((0, node_url_1.fileURLToPath)(import.meta.url));
var repoRoot = (0, node_path_1.resolve)(gatewayAdaptersDir, "..", "..", "..", "..");
var adapterPackagesDir = (0, node_path_1.join)(repoRoot, "packages", "adapters");
var builtInAdapterModules = [
    resolvers_1.authAdapter,
    resolvers_3.commerceAdapter,
    resolvers_5.searchAdapter,
    resolvers_7.socialAdapter,
    resolvers_4.listsAdapter,
    resolvers_2.chatAdapter,
    resolvers_6.sellerAdapter
];
var isAdapterModule = function (value) {
    if (!value || typeof value !== "object") {
        return false;
    }
    var candidate = value;
    return (typeof candidate.name === "string" &&
        typeof candidate.typeDefs === "string" &&
        !!candidate.resolvers &&
        typeof candidate.resolvers === "object");
};
var discoverExternalAdapterModules = function () { return __awaiter(void 0, void 0, void 0, function () {
    var discovered, existingNames, entries, _i, entries_1, entry, resolversPath, resolverModule, loaded, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(0, node_fs_1.existsSync)(adapterPackagesDir)) {
                    return [2 /*return*/, []];
                }
                discovered = [];
                existingNames = new Set(builtInAdapterModules.map(function (module) { return module.name; }));
                entries = (0, node_fs_1.readdirSync)(adapterPackagesDir, { withFileTypes: true });
                _i = 0, entries_1 = entries;
                _a.label = 1;
            case 1:
                if (!(_i < entries_1.length)) return [3 /*break*/, 6];
                entry = entries_1[_i];
                if (!entry.isDirectory() || !entry.name.startsWith("adapter-")) {
                    return [3 /*break*/, 5];
                }
                resolversPath = (0, node_path_1.join)(adapterPackagesDir, entry.name, "resolvers.ts");
                if (!(0, node_fs_1.existsSync)(resolversPath)) {
                    return [3 /*break*/, 5];
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, Promise.resolve("".concat((0, node_url_1.pathToFileURL)(resolversPath).href)).then(function (s) { return require(s); })];
            case 3:
                resolverModule = _a.sent();
                loaded = Object.values(resolverModule).find(isAdapterModule);
                if (!loaded || existingNames.has(loaded.name)) {
                    return [3 /*break*/, 5];
                }
                discovered.push(loaded);
                existingNames.add(loaded.name);
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.warn("[gateway] Failed to load external adapter resolvers from ".concat(entry.name, ":"), error_1);
                return [3 /*break*/, 5];
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/, discovered];
        }
    });
}); };
var externalAdapterModules = await discoverExternalAdapterModules();
exports.adapterModules = __spreadArray(__spreadArray([], builtInAdapterModules, true), externalAdapterModules, true);
