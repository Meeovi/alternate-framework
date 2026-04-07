"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSessionPlugin = exports.buildSession = void 0;
var buildSession = function (request, requestId) {
    var _a;
    return ({
        id: (_a = request.headers.get("x-session-id")) !== null && _a !== void 0 ? _a : requestId,
        issuedAt: Date.now()
    });
};
exports.buildSession = buildSession;
var useSessionPlugin = function () { return ({
    onContextBuilding: function () {
        return {
            onContextBuildingDone: function (_a) {
                var extendContext = _a.extendContext;
                extendContext({
                    sessionInjectedAt: new Date().toISOString()
                });
            }
        };
    }
}); };
exports.useSessionPlugin = useSessionPlugin;
