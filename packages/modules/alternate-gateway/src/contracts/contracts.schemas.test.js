"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var auth_schema_1 = require("./auth/auth.schema");
var search_schemas_1 = require("./search/search.schemas");
(0, vitest_1.describe)('contracts schemas', function () {
    (0, vitest_1.it)('accepts valid login input payload', function () {
        var parsed = auth_schema_1.LoginInputSchema.parse({
            email: 'jane@example.com',
            password: 's3cure-passw0rd',
            correlationId: 'corr-12345',
        });
        (0, vitest_1.expect)(parsed.email).toBe('jane@example.com');
    });
    (0, vitest_1.it)('rejects invalid login password length', function () {
        (0, vitest_1.expect)(function () {
            return auth_schema_1.LoginInputSchema.parse({
                email: 'jane@example.com',
                password: 'short',
                correlationId: 'corr-12345',
            });
        }).toThrow();
    });
    (0, vitest_1.it)('enforces bounded search page size', function () {
        (0, vitest_1.expect)(function () {
            return search_schemas_1.SearchInputSchema.parse({
                query: 'laptop',
                page: 1,
                pageSize: 100,
                correlationId: 'corr-12345',
                actorId: '9f1d50e0-9caa-4f9f-b8d2-4128e1efa8a3',
                filters: [],
                sort: [],
            });
        }).toThrow();
    });
});
