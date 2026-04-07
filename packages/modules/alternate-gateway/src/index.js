"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var node_http_1 = require("node:http");
var server_1 = require("./server");
var port = Number((_a = process.env.GATEWAY_PORT) !== null && _a !== void 0 ? _a : 4000);
var yoga = (0, server_1.createGatewayYogaServer)();
var httpServer = (0, node_http_1.createServer)(yoga);
httpServer.listen(port, function () {
    console.log("[gateway] listening on http://localhost:".concat(port, "/graphql"));
});
