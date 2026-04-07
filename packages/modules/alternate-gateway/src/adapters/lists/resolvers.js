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
exports.listsAdapter = void 0;
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var typeDefs = (0, node_fs_1.readFileSync)((0, node_path_1.join)(process.cwd(), "app", "adapters", "lists", "schema.graphql"), "utf-8");
var getFediverseBinding = function (context) {
    var _a, _b;
    var listsFediverse = (_a = context.adapters["lists"]) === null || _a === void 0 ? void 0 : _a["fediverse"];
    if (listsFediverse && typeof listsFediverse === "object") {
        return listsFediverse;
    }
    var federationFediverse = (_b = context.adapters["federation"]) === null || _b === void 0 ? void 0 : _b["fediverse"];
    if (federationFediverse && typeof federationFediverse === "object") {
        return federationFediverse;
    }
    return undefined;
};
exports.listsAdapter = {
    name: "lists",
    typeDefs: typeDefs,
    resolvers: {
        Query: {
            listsByOwner: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, [
                            {
                                id: "list-1",
                                ownerId: args.ownerId,
                                title: "Starter List",
                                items: ["item-1", "item-2"]
                            }
                        ]];
                });
            }); },
            listsFediverseAuthors: function (_, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                var fediverse, feed, uniqueAuthors, _i, feed_1, entry, author;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            fediverse = getFediverseBinding(context);
                            if (!(fediverse === null || fediverse === void 0 ? void 0 : fediverse.getUnifiedFeed)) {
                                return [2 /*return*/, []];
                            }
                            return [4 /*yield*/, fediverse.getUnifiedFeed(args.identity, (_a = args.limit) !== null && _a !== void 0 ? _a : 20)];
                        case 1:
                            feed = _c.sent();
                            uniqueAuthors = new Set();
                            for (_i = 0, feed_1 = feed; _i < feed_1.length; _i++) {
                                entry = feed_1[_i];
                                author = String((_b = entry.author) !== null && _b !== void 0 ? _b : "").trim();
                                if (author) {
                                    uniqueAuthors.add(author);
                                }
                            }
                            return [2 /*return*/, Array.from(uniqueAuthors)];
                    }
                });
            }); }
        },
        Mutation: {
            listsCreate: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, ({
                            id: crypto.randomUUID(),
                            ownerId: args.input.ownerId,
                            title: args.input.title,
                            items: []
                        })];
                });
            }); },
            listsUpdate: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    return [2 /*return*/, ({
                            id: args.input.id,
                            ownerId: "owner-1",
                            title: (_a = args.input.title) !== null && _a !== void 0 ? _a : "Updated List",
                            items: (_b = args.input.items) !== null && _b !== void 0 ? _b : []
                        })];
                });
            }); },
            listsDelete: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, true];
            }); }); }
        }
    }
};
