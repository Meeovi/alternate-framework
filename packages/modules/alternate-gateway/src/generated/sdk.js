"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGatewaySdk = void 0;
var createGatewaySdk = function (requester) { return ({
    authGetUser: function () { return requester("authGetUser"); },
    commerceGetProduct: function (variables) { return requester("commerceGetProduct", variables); },
    searchQuery: function (variables) {
        return requester("searchQuery", variables);
    },
    socialFeed: function (variables) { return requester("socialFeed", variables); },
    listsByOwner: function (variables) { return requester("listsByOwner", variables); },
    chatMessages: function (variables) { return requester("chatMessages", variables); },
    sellerAnalytics: function (variables) { return requester("sellerAnalytics", variables); }
}); };
exports.createGatewaySdk = createGatewaySdk;
