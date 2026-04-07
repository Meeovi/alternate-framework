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
exports.useJwtAuthPlugin = exports.verifyJwtFromRequest = void 0;
var parseJwtPayload = function (token) {
    var parts = token.split(".");
    if (parts.length !== 3) {
        return null;
    }
    try {
        var payloadJson = Buffer.from(parts[1], "base64url").toString("utf-8");
        return JSON.parse(payloadJson);
    }
    catch (_a) {
        return null;
    }
};
var verifyJwtFromRequest = function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var header, token, payload;
    var _a;
    return __generator(this, function (_b) {
        header = request.headers.get("authorization");
        if (!(header === null || header === void 0 ? void 0 : header.startsWith("Bearer "))) {
            return [2 /*return*/, null];
        }
        token = header.replace("Bearer ", "").trim();
        payload = parseJwtPayload(token);
        if (!(payload === null || payload === void 0 ? void 0 : payload.sub)) {
            return [2 /*return*/, null];
        }
        return [2 /*return*/, {
                id: payload.sub,
                email: payload.email,
                roles: (_a = payload.roles) !== null && _a !== void 0 ? _a : ["user"]
            }];
    });
}); };
exports.verifyJwtFromRequest = verifyJwtFromRequest;
var useJwtAuthPlugin = function () { return ({
    onRequest: function (_a) {
        var request = _a.request, endResponse = _a.endResponse;
        if (request.method === "OPTIONS") {
            return;
        }
        var enforceJwt = process.env.GATEWAY_REQUIRE_JWT === "true";
        if (enforceJwt && !request.headers.get("authorization")) {
            endResponse(new Response(JSON.stringify({ error: "Missing authorization token" }), {
                status: 401,
                headers: { "content-type": "application/json" }
            }));
        }
    }
}); };
exports.useJwtAuthPlugin = useJwtAuthPlugin;
