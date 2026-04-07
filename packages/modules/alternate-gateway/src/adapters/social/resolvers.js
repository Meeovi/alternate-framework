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
exports.socialAdapter = void 0;
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var typeDefs = (0, node_fs_1.readFileSync)((0, node_path_1.join)(process.cwd(), "app", "adapters", "social", "schema.graphql"), "utf-8");
var getFediverseBinding = function (context) {
    var _a, _b;
    var socialFediverse = (_a = context.adapters["social"]) === null || _a === void 0 ? void 0 : _a["fediverse"];
    if (socialFediverse && typeof socialFediverse === "object") {
        return socialFediverse;
    }
    var federationFediverse = (_b = context.adapters["federation"]) === null || _b === void 0 ? void 0 : _b["fediverse"];
    if (federationFediverse && typeof federationFediverse === "object") {
        return federationFediverse;
    }
    return undefined;
};
exports.socialAdapter = {
    name: "social",
    typeDefs: typeDefs,
    resolvers: {
        Query: {
            socialFeed: function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, [
                            {
                                id: "post-1",
                                body: "Hello from the social adapter",
                                authorId: "user-local-dev",
                                createdAt: new Date().toISOString()
                            }
                        ]];
                });
            }); },
            socialNotifications: function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, [
                            {
                                id: "notif-1",
                                text: "You have a new follower",
                                read: false
                            }
                        ]];
                });
            }); },
            socialFediverseFeed: function (_, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                var fediverse;
                return __generator(this, function (_a) {
                    fediverse = getFediverseBinding(context);
                    if (!(fediverse === null || fediverse === void 0 ? void 0 : fediverse.getUnifiedFeed)) {
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, fediverse.getUnifiedFeed(args.identity, args.limit)];
                });
            }); }
        },
        Mutation: {
            socialPost: function (_, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    return [2 /*return*/, ({
                            id: crypto.randomUUID(),
                            body: args.input.body,
                            authorId: (_b = (_a = context.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : "anonymous",
                            createdAt: new Date().toISOString()
                        })];
                });
            }); },
            socialFediversePublish: function (_, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                var fediverse, protocol;
                return __generator(this, function (_a) {
                    fediverse = getFediverseBinding(context);
                    if (!(fediverse === null || fediverse === void 0 ? void 0 : fediverse.publish)) {
                        return [2 /*return*/, { success: false, reason: "fediverse-adapter-unavailable" }];
                    }
                    protocol = args.protocol === "atproto" ? "atproto" : "activitypub";
                    return [2 /*return*/, fediverse.publish({
                            protocol: protocol,
                            content: args.content,
                            actor: args.actor
                        })];
                });
            }); }
        }
    }
};
