"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatMeshSource = void 0;
var chatMeshSource = function () {
    var _a;
    return ({
        name: "chat",
        handler: "graphql",
        endpoint: (_a = process.env.CHAT_GRAPHQL_URL) !== null && _a !== void 0 ? _a : "http://localhost:4106/graphql"
    });
};
exports.chatMeshSource = chatMeshSource;
