"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBaseAppEnv = void 0;
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var node_url_1 = require("node:url");
var currentDir = (0, node_path_1.dirname)((0, node_url_1.fileURLToPath)(import.meta.url));
var repoRoot = (0, node_path_1.resolve)(currentDir, "..", "..", "..", "..");
var parseEnvFile = function (content) {
    var parsed = {};
    var lines = content.split(/\r?\n/);
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var rawLine = lines_1[_i];
        var line = rawLine.trim();
        if (!line || line.startsWith("#")) {
            continue;
        }
        var withoutExport = line.startsWith("export ") ? line.slice(7).trim() : line;
        var separatorIndex = withoutExport.indexOf("=");
        if (separatorIndex <= 0) {
            continue;
        }
        var key = withoutExport.slice(0, separatorIndex).trim();
        var value = withoutExport.slice(separatorIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        parsed[key] = value;
    }
    return parsed;
};
var loadEnvFromPath = function (envFilePath) {
    if (!(0, node_fs_1.existsSync)(envFilePath)) {
        return false;
    }
    var content = (0, node_fs_1.readFileSync)(envFilePath, "utf-8");
    var parsed = parseEnvFile(content);
    for (var _i = 0, _a = Object.entries(parsed); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
    return true;
};
var loadBaseAppEnv = function () {
    var _a, _b;
    var explicitBaseAppDir = (_b = (_a = process.env.BASE_APP_DIR) !== null && _a !== void 0 ? _a : process.env.BASE_APP_PATH) !== null && _b !== void 0 ? _b : process.env.NUXT_BASE_APP_DIR;
    var candidateAppDirs = [
        explicitBaseAppDir,
        (0, node_path_1.join)(repoRoot, "themes", "framework", "starter-template"),
        (0, node_path_1.join)(repoRoot, "apps", "ecosystem", "meeovi-app")
    ].filter(function (path) { return !!path; });
    for (var _i = 0, candidateAppDirs_1 = candidateAppDirs; _i < candidateAppDirs_1.length; _i++) {
        var appDir = candidateAppDirs_1[_i];
        var normalizedDir = (0, node_path_1.resolve)(appDir);
        var envCandidates = [(0, node_path_1.join)(normalizedDir, ".env.local"), (0, node_path_1.join)(normalizedDir, ".env")];
        var loadedFromAny = false;
        for (var _c = 0, envCandidates_1 = envCandidates; _c < envCandidates_1.length; _c++) {
            var envFilePath = envCandidates_1[_c];
            loadedFromAny = loadEnvFromPath(envFilePath) || loadedFromAny;
        }
        if (loadedFromAny) {
            return normalizedDir;
        }
    }
    return null;
};
exports.loadBaseAppEnv = loadBaseAppEnv;
