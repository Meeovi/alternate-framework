"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
var search_1 = require("./alternate-search/core/search");
var pgvector_1 = require("../../packages/modules/alternate-search/packages/alternate-search/adapters/pgvector");
var indexes_1 = require("../../packages/modules/alternate-search/packages/alternate-search/schema/indexes");
var plugins_1 = require("../../packages/modules/alternate-search/plugins");
exports.search = (0, search_1.createSearch)({
    adapter: (0, pgvector_1.pgvectorAdapter)({ connectionString: process.env.DB_URL }),
    indexes: indexes_1.indexes,
    plugins: [
        (0, plugins_1.semanticSearch)({ provider: "openai" }),
        (0, plugins_1.autocomplete)()
    ]
});
